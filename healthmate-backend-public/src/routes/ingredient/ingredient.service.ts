import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Ingredient, IngredientDocument} from "./schema/ingredient.schema";
import {Model} from "mongoose";
import {readExcelFile} from "./utils/excel.util";
import {PaginateDto} from "../../shared/dtos/paginate.dto";
import {PaginatedResult} from "../../shared/interfaces/paginated-result.interface";
import {IngredientForbiddenError, IngredientNotFoundError} from "./ingredient.error";
import { Rolename } from '../../shared/constants/role.constant';


@Injectable()
export class IngredientService {
    constructor(
        @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>
    ) {}

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
        await this.ingredientModel.deleteMany({})
        return this.ingredientModel.insertMany(ingredients);
    }
    async findAllPaginate(dto: PaginateDto, userId?: any, roleName?: string): Promise<PaginatedResult<IngredientDocument>> {
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
            const total = await this.ingredientModel.countDocuments(filter).exec();

            if (total === 0) {
                throw new IngredientNotFoundError('No ingredients found with the given filter');
            }

            const skip = (page - 1) * limit;
            const items = await this.ingredientModel
                .find(filter)
                .sort({ _id: 1 })
                .skip(skip)
                .limit(limit)
                .exec();

            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            if (error instanceof IngredientNotFoundError) {
                throw error;
            }
            console.error('[IngredientService.findAllPaginate] Unexpected error:', error);
            throw new Error('Failed to fetch ingredients');
        }
    }

    async create(data: any, userId: any, roleName: string): Promise<IngredientDocument> {
        // Admin creates public ingredient (no belongsTo)
        // Customer creates private ingredient (belongsTo = userId)
        const payload = {
            ...data,
            belongsTo: roleName === Rolename.Customer ? userId : undefined,
        } as Partial<Ingredient>;
        return this.ingredientModel.create(payload);
    }

    async update(ingredientId: string, data: any, userId: any, roleName: string): Promise<IngredientDocument> {
        const doc = await this.ingredientModel.findById(ingredientId).exec();
        if (!doc) throw new IngredientNotFoundError('Ingredient not found');

        // Ownership rules
        const isPublic = !doc.belongsTo;
        if (roleName === Rolename.Customer) {
            if (isPublic || String(doc.belongsTo) !== String(userId)) {
                throw new IngredientForbiddenError('Cannot update ingredient you do not own');
            }
        } else if (roleName === Rolename.Admin) {
            if (!isPublic) {
                throw new IngredientForbiddenError('Admin cannot update customer-owned ingredient');
            }
        }

        Object.assign(doc, data);
        await doc.save();
        return doc;
    }

    async delete(ingredientId: string, userId: any, roleName: string): Promise<void> {
        const doc = await this.ingredientModel.findById(ingredientId).exec();
        if (!doc) throw new IngredientNotFoundError('Ingredient not found');

        const isPublic = !doc.belongsTo;
        if (roleName === Rolename.Customer) {
            if (isPublic || String(doc.belongsTo) !== String(userId)) {
                throw new IngredientForbiddenError('Cannot delete ingredient you do not own');
            }
        } else if (roleName === Rolename.Admin) {
            if (!isPublic) {
                throw new IngredientForbiddenError('Admin cannot delete customer-owned ingredient');
            }
        }

        await this.ingredientModel.deleteOne({ _id: ingredientId }).exec();
    }
}
