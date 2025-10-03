import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Dish, DishDocument } from "./schema/dish.schema";
import { Ingredient, IngredientDocument } from "../ingredient/schema/ingredient.schema";
import { Model, Types } from "mongoose";
import { PaginateDto } from "../../shared/dtos/paginate.dto";
import { PaginatedResult } from "../../shared/interfaces/paginated-result.interface";
import { DishForbiddenError, DishNotFoundError } from "./dish.error";
import { Rolename } from '../../shared/constants/role.constant';
import { DishRepo } from './dish.repo';

@Injectable()
export class DishService {
    constructor(
        private readonly dishRepo: DishRepo,
        @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>,
    ) {}

    private validateObjectId(id: string): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new DishNotFoundError('Invalid dish ID format');
        }
    }

    private async calculateNutritionalValues(ingredients: any[]): Promise<{
        totalCalories: number;
        totalCarbs: number;
        totalProtein: number;
        totalFat: number;
        totalFiber: number;
        totalSugar: number;
    }> {
        let totals = {
            totalCalories: 0,
            totalCarbs: 0,
            totalProtein: 0,
            totalFat: 0,
            totalFiber: 0,
            totalSugar: 0,
        };

        for (const ingredient of ingredients) {
            if (!ingredient || ingredient.deprecated) {
                continue;
            }

            const amount = ingredient.amount;
            let nutrition;

            // If ingredient is already populated (has nutritional data)
            if (ingredient.ingredient && typeof ingredient.ingredient === 'object' && ingredient.ingredient.caloPer100g !== undefined) {
                nutrition = ingredient.ingredient;
            } else {
                // If ingredient is just an ID, fetch the full ingredient data
                const ingredientId = ingredient.ingredient;
                const ingredientDoc = await this.ingredientModel.findById(ingredientId).exec();
                if (!ingredientDoc) {
                    continue;
                }
                nutrition = ingredientDoc;
            }

            if (!nutrition) {
                continue;
            }

            // Calculate nutritional values based on amount (assuming nutrition is per 100g)
            const factor = amount / 100;
            totals.totalCalories += (nutrition.caloPer100g || 0) * factor;
            totals.totalCarbs += (nutrition.carbsPer100g || 0) * factor;
            totals.totalProtein += (nutrition.proteinPer100g || 0) * factor;
            totals.totalFat += (nutrition.fatPer100g || 0) * factor;
            totals.totalFiber += (nutrition.fiberPer100g || 0) * factor;
            totals.totalSugar += (nutrition.sugarPer100g || 0) * factor;
        }

        return totals;
    }

    async findAllPaginate(dto: PaginateDto, userId?: any, roleName?: string): Promise<PaginatedResult<DishDocument>> {
        const { page = 1, limit = 20, type } = dto;

        const filter: any = {};
        if (type) {
            filter.type = type;
        }

        // Visibility rules
        if (roleName === Rolename.Customer && userId) {
            filter.$or = [{ belongsTo: null }, { belongsTo: { $exists: false } }, { belongsTo: userId }];
        } else if (roleName === Rolename.Admin) {
            filter.$or = [{ belongsTo: null }, { belongsTo: { $exists: false } }];
        }

        try {
            const result = await this.dishRepo.findAllPaginated(page, limit, filter);

            if (result.total === 0) {
                throw new DishNotFoundError('No dishes found with the given filter');
            }

            return {
                items: result.items,
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            };
        } catch (error) {
            if (error instanceof DishNotFoundError) {
                throw error;
            }
            console.error('[DishService.findAllPaginate] Unexpected error:', error);
            throw new Error('Failed to fetch dishes');
        }
    }

    async create(data: any, userId: any, roleName: string): Promise<DishDocument> {
        try {
            // Admin creates public dish (no belongsTo)
            // Customer creates private dish (belongsTo = userId)
            const payload = {
                ...data,
                belongsTo: roleName === Rolename.Customer ? userId : undefined,
            } as Partial<Dish>;

            // Calculate nutritional values
            const nutritionalValues = await this.calculateNutritionalValues(data.ingredients);
            payload.totalCalories = nutritionalValues.totalCalories;
            payload.totalCarbs = nutritionalValues.totalCarbs;
            payload.totalProtein = nutritionalValues.totalProtein;
            payload.totalFat = nutritionalValues.totalFat;
            payload.totalFiber = nutritionalValues.totalFiber;
            payload.totalSugar = nutritionalValues.totalSugar;

            return this.dishRepo.create(payload);
        } catch (error) {
            console.error('[DishService.create] Unexpected error:', error);
            throw new Error('Failed to create dish');
        }
    }

    async update(dishId: string, data: any, userId: any, roleName: string): Promise<DishDocument> {
        try {
            this.validateObjectId(dishId);
            const doc = await this.dishRepo.findById(new Types.ObjectId(dishId));
            if (!doc) throw new DishNotFoundError('Dish not found');

            // Ownership rules
            const isPublic = !doc.belongsTo || String(doc.belongsTo).trim() === '';
            if (roleName === Rolename.Customer) {
                if (isPublic || String(doc.belongsTo) !== String(userId)) {
                    throw new DishForbiddenError('Cannot update dish you do not own');
                }
            } else if (roleName === Rolename.Admin) {
                if (!isPublic) {
                    throw new DishForbiddenError('Admin cannot update customer-owned dish');
                }
            }

            // Update nutritional values if ingredients are being updated
            if (data.ingredients) {
                const nutritionalValues = await this.calculateNutritionalValues(data.ingredients);
                data.totalCalories = nutritionalValues.totalCalories;
                data.totalCarbs = nutritionalValues.totalCarbs;
                data.totalProtein = nutritionalValues.totalProtein;
                data.totalFat = nutritionalValues.totalFat;
                data.totalFiber = nutritionalValues.totalFiber;
                data.totalSugar = nutritionalValues.totalSugar;
            }

            const updatedDoc = await this.dishRepo.update(new Types.ObjectId(dishId), data);
            return updatedDoc!;
        } catch (error) {
            if (error instanceof DishNotFoundError || error instanceof DishForbiddenError) {
                throw error;
            }
            console.error('[DishService.update] Unexpected error:', error);
            throw new Error('Failed to update dish');
        }
    }

    async delete(dishId: string, userId: any, roleName: string): Promise<void> {
        try {
            this.validateObjectId(dishId);
            const doc = await this.dishRepo.findById(new Types.ObjectId(dishId));
            if (!doc) throw new DishNotFoundError('Dish not found');

            const isPublic = !doc.belongsTo || String(doc.belongsTo).trim() === '';
            if (roleName === Rolename.Customer) {
                if (isPublic || String(doc.belongsTo) !== String(userId)) {
                    throw new DishForbiddenError('Cannot delete dish you do not own');
                }
            } else if (roleName === Rolename.Admin) {
                if (!isPublic) {
                    throw new DishForbiddenError('Admin cannot delete customer-owned dish');
                }
            }

            await this.dishRepo.delete(new Types.ObjectId(dishId));
        } catch (error) {
            if (error instanceof DishNotFoundError || error instanceof DishForbiddenError) {
                throw error;
            }
            console.error('[DishService.delete] Unexpected error:', error);
            throw new Error('Failed to delete dish');
        }
    }

    async findById(dishId: string, userId: any, roleName: string): Promise<DishDocument> {
        try {
            this.validateObjectId(dishId);
            const doc = await this.dishRepo.findById(new Types.ObjectId(dishId));
            if (!doc) throw new DishNotFoundError('Dish not found');

            // Ownership rules
            const isPublic = !doc.belongsTo || String(doc.belongsTo).trim() === '';
            if (roleName === Rolename.Customer && userId) {
                if (!isPublic && String(doc.belongsTo) !== String(userId)) {
                    throw new DishForbiddenError('Cannot access dish you do not own');
                }
            } else if (roleName === Rolename.Admin) {
                if (!isPublic) {
                    throw new DishForbiddenError('Admin cannot access customer-owned dish');
                }
            }

            return doc;
        } catch (error) {
            if (error instanceof DishNotFoundError || error instanceof DishForbiddenError) {
                throw error;
            }
            console.error('[DishService.findById] Unexpected error:', error);
            throw new Error('Failed to fetch dish');
        }
    }
}
