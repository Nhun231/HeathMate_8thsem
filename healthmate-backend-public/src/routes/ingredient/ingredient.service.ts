import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Ingredient, IngredientDocument} from "./schema/ingredient.schema";
import {Model} from "mongoose";
import {readExcelFile} from "./utils/excel.util";
import {PaginateDto} from "../../shared/dtos/paginate.dto";
import {PaginatedResult} from "../../shared/interfaces/paginated-result.interface";
import {IngredientForbiddenError, IngredientNotFoundError} from "./ingredient.error";
import { Rolename } from '../../shared/constants/role.constant';
import { Types } from 'mongoose';
import { IngredientRepo } from './ingredient.repo';


@Injectable()
export class IngredientService {
    constructor(
        private readonly ingredientRepo: IngredientRepo,
        @InjectModel('Dish') private dishModel: Model<any>
    ) {}

    private validateObjectId(id: string): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new IngredientNotFoundError('Invalid ingredient ID format');
        }
    }

    async importFromExcel(): Promise<Ingredient[]>{
        const data = readExcelFile();
        console.log("Service",data.at(0));
        const ingredients = data.map((row: any)=>({
            name: row['Name'],
            type: row['Type'],
            caloPer100g: row['Calo'],
            carbsPer100g: row['Carb'],
            proteinPer100g: row['Protein'],
            fatPer100g: row['Lipid'],
            fiberPer100g: row['Fiber'],
            sugarPer100g: row['Sugar'],
        }))
        console.log("Service",ingredients.at(0));
        await this.ingredientRepo.deleteMany({})
        return this.ingredientRepo.insertMany(ingredients);
    }
    async findAllPaginate(dto: PaginateDto, userId?: any, roleName?: string): Promise<PaginatedResult<IngredientDocument>> {
        const { page = 1, limit = 20, type, search } = dto;

        const filter: any = {};
        if (type) {
            filter.type = type;
        }
        
        // Add search functionality
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        // Visibility rules
        if (roleName === Rolename.Customer && userId) {
            filter.$or = [{ belongsTo: null }, { belongsTo: { $exists: false } }, { belongsTo: userId }];
        } else if (roleName === Rolename.Admin) {
            filter.$or = [{ belongsTo: null }, { belongsTo: { $exists: false } }];
        }

        try {
            const result = await this.ingredientRepo.findAllPaginated(page, limit, filter, search);

            if (result.total === 0) {
                throw new IngredientNotFoundError('No ingredients found with the given filter');
            }

            return {
                items: result.items,
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            };
        } catch (error) {
            if (error instanceof IngredientNotFoundError) {
                throw error;
            }
            console.error('[IngredientService.findAllPaginate] Unexpected error:', error);
            throw new Error('Failed to fetch ingredients');
        }
    }

    async findUserCustomIngredients(dto: PaginateDto, userId: any): Promise<PaginatedResult<IngredientDocument>> {
        const { page = 1, limit = 20, search } = dto;
        
        try {
            const result = await this.ingredientRepo.findByUserIdPaginated(userId, page, limit, {}, search);

            if (result.total === 0) {
                return {
                    items: [],
                    total: 0,
                    page,
                    limit,
                    totalPages: 0,
                };
            }

            return result;
        } catch (error) {
            console.error('[IngredientService.findUserCustomIngredients] Unexpected error:', error);
            throw new Error('Failed to fetch custom ingredients');
        }
    }

    async create(data: any, userId: any, roleName: string): Promise<IngredientDocument> {
        try {
            // Admin creates public ingredient (no belongsTo)
            // Customer creates private ingredient (belongsTo = userId)
            const payload = {
                ...data,
                belongsTo: roleName === Rolename.Customer ? userId : undefined,
            } as Partial<Ingredient>;
            return this.ingredientRepo.create(payload);
        } catch (error) {
            console.error('[IngredientService.create] Unexpected error:', error);
            throw new Error('Failed to create ingredient');
        }
    }

    async update(ingredientId: string, data: any, userId: any, roleName: string): Promise<IngredientDocument> {
        try {
            this.validateObjectId(ingredientId);
            const doc = await this.ingredientRepo.findById(new Types.ObjectId(ingredientId));
            if (!doc) throw new IngredientNotFoundError('Ingredient not found');
            // Permission
            const isPublic = !doc.belongsTo || String(doc.belongsTo).trim() === '';
            if (roleName === Rolename.Customer) {
                if (isPublic || String(doc.belongsTo) !== String(userId)) {
                    throw new IngredientForbiddenError('Cannot update ingredient you do not own');
                }
            } else if (roleName === Rolename.Admin) {
                if (!isPublic) {
                    throw new IngredientForbiddenError('Admin cannot update customer-owned ingredient');
                }
            }

            const updatedDoc = await this.ingredientRepo.update(new Types.ObjectId(ingredientId), data);
            return updatedDoc!;
        } catch (error) {
            if (error instanceof IngredientNotFoundError || error instanceof IngredientForbiddenError) {
                throw error;
            }
            console.error('[IngredientService.update] Unexpected error:', error);
            throw new Error('Failed to update ingredient');
        }
    }

    async delete(ingredientId: string, userId: any, roleName: string): Promise<void> {
        try {
            this.validateObjectId(ingredientId);
            const doc = await this.ingredientRepo.findById(new Types.ObjectId(ingredientId));
            if (!doc) throw new IngredientNotFoundError('Ingredient not found');

            const isPublic = !doc.belongsTo || String(doc.belongsTo).trim() === '';
            if (roleName === Rolename.Customer) {
                if (isPublic || String(doc.belongsTo) !== String(userId)) {
                    throw new IngredientForbiddenError('Cannot delete ingredient you do not own');
                }
            } else if (roleName === Rolename.Admin) {
                if (!isPublic) {
                    throw new IngredientForbiddenError('Admin cannot delete customer-owned ingredient');
                }
            }

            // Mark ingredient usage in dishes as deprecated, recalc totals, do NOT remove from dish
            const dishes = await this.dishModel.find({ 'ingredients.ingredient': ingredientId }).exec();
            for (const dish of dishes) {
                let touched = false;
                for (const item of dish.ingredients) {
                    if (String(item.ingredient) === String(ingredientId)) {
                        if (!item.deprecated) {
                            item.deprecated = true;
                            touched = true;
                        }
                    }
                }
                if (touched) {
                    // Recalculate totals skipping deprecated items; populate-like minimal fields are not present here
                    const activeItems = dish.ingredients.filter((i: any) => !i.deprecated);
                    // Fetch ingredient docs for accurate nutrition
                    const ingredientIds = activeItems.map((i: any) => i.ingredient);
                    const ingDocs = await this.ingredientRepo.findAll();
                    const idToIng: Record<string, any> = {};
                    for (const ing of ingDocs) idToIng[String(ing._id)] = ing;
                    let totals = { totalCalories: 0, totalCarbs: 0, totalProtein: 0, totalFat: 0, totalFiber: 0, totalSugar: 0 };
                    for (const i of activeItems) {
                        const ing = idToIng[String(i.ingredient)];
                        if (!ing) continue;
                        const factor = (i.amount || 0) / 100;
                        totals.totalCalories += (ing.caloPer100g || 0) * factor;
                        totals.totalCarbs += (ing.carbsPer100g || 0) * factor;
                        totals.totalProtein += (ing.proteinPer100g || 0) * factor;
                        totals.totalFat += (ing.fatPer100g || 0) * factor;
                        totals.totalFiber += (ing.fiberPer100g || 0) * factor;
                        totals.totalSugar += (ing.sugarPer100g || 0) * factor;
                    }
                    dish.totalCalories = totals.totalCalories;
                    dish.totalCarbs = totals.totalCarbs;
                    dish.totalProtein = totals.totalProtein;
                    dish.totalFat = totals.totalFat;
                    dish.totalFiber = totals.totalFiber;
                    dish.totalSugar = totals.totalSugar;
                    await dish.save();
                }
            }

            // Finally, delete the ingredient document
            await this.ingredientRepo.delete(new Types.ObjectId(ingredientId));
        } catch (error) {
            if (error instanceof IngredientNotFoundError || error instanceof IngredientForbiddenError) {
                throw error;
            }
            console.error('[IngredientService.delete] Unexpected error:', error);
            throw new Error('Failed to delete ingredient');
        }
    }
}
