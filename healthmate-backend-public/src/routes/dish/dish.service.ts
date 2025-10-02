import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Dish, DishDocument } from "./schema/dish.schema";
import { Model, Types } from "mongoose";
import { PaginateDto } from "../../shared/dtos/paginate.dto";
import { PaginatedResult } from "../../shared/interfaces/paginated-result.interface";
import { DishForbiddenError, DishNotFoundError } from "./dish.error";
import { Rolename } from '../../shared/constants/role.constant';

@Injectable()
export class DishService {
    constructor(
        @InjectModel(Dish.name) private dishModel: Model<DishDocument>
    ) {}

    private validateObjectId(id: string): void {
        if (!Types.ObjectId.isValid(id)) {
            throw new DishNotFoundError('Invalid dish ID format');
        }
    }

    private calculateNutritionalValues(ingredients: any[]): {
        totalCalories: number;
        totalCarbs: number;
        totalProtein: number;
        totalFat: number;
        totalFiber: number;
        totalSugar: number;
    } {
        return ingredients.reduce((totals, ingredient) => {
            if (!ingredient || ingredient.deprecated) {
                return totals;
            }
            const amount = ingredient.amount;
            const nutrition = ingredient.ingredient;
            if (!nutrition) {
                return totals;
            }
            // Calculate nutritional values based on amount (assuming nutrition is per 100g)
            const factor = amount / 100;
            return {
                totalCalories: totals.totalCalories + ((nutrition.caloPer100g || 0) * factor),
                totalCarbs: totals.totalCarbs + ((nutrition.carbsPer100g || 0) * factor),
                totalProtein: totals.totalProtein + ((nutrition.proteinPer100g || 0) * factor),
                totalFat: totals.totalFat + ((nutrition.fatPer100g || 0) * factor),
                totalFiber: totals.totalFiber + ((nutrition.fiberPer100g || 0) * factor),
                totalSugar: totals.totalSugar + ((nutrition.sugarPer100g || 0) * factor),
            };
        }, {
            totalCalories: 0,
            totalCarbs: 0,
            totalProtein: 0,
            totalFat: 0,
            totalFiber: 0,
            totalSugar: 0,
        });
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
            const total = await this.dishModel.countDocuments(filter).exec();

            if (total === 0) {
                throw new DishNotFoundError('No dishes found with the given filter');
            }

            const skip = (page - 1) * limit;
            const items = await this.dishModel
                .find(filter)
                .populate('ingredients.ingredient')
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
            const nutritionalValues = this.calculateNutritionalValues(data.ingredients);
            payload.totalCalories = nutritionalValues.totalCalories;
            payload.totalCarbs = nutritionalValues.totalCarbs;
            payload.totalProtein = nutritionalValues.totalProtein;
            payload.totalFat = nutritionalValues.totalFat;
            payload.totalFiber = nutritionalValues.totalFiber;
            payload.totalSugar = nutritionalValues.totalSugar;

            return this.dishModel.create(payload);
        } catch (error) {
            console.error('[DishService.create] Unexpected error:', error);
            throw new Error('Failed to create dish');
        }
    }

    async update(dishId: string, data: any, userId: any, roleName: string): Promise<DishDocument> {
        try {
            this.validateObjectId(dishId);
            const doc = await this.dishModel.findById(dishId).populate('ingredients.ingredient').exec();
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
                const nutritionalValues = this.calculateNutritionalValues(data.ingredients);
                data.totalCalories = nutritionalValues.totalCalories;
                data.totalCarbs = nutritionalValues.totalCarbs;
                data.totalProtein = nutritionalValues.totalProtein;
                data.totalFat = nutritionalValues.totalFat;
                data.totalFiber = nutritionalValues.totalFiber;
                data.totalSugar = nutritionalValues.totalSugar;
            }

            Object.assign(doc, data);
            await doc.save();
            return doc;
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
            const doc = await this.dishModel.findById(dishId).exec();
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

            await this.dishModel.deleteOne({ _id: dishId }).exec();
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
            const doc = await this.dishModel.findById(dishId).populate('ingredients.ingredient').exec();
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
