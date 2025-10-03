import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ingredient, IngredientDocument } from './schema/ingredient.schema';

@Injectable()
export class IngredientRepo {
    constructor(
        @InjectModel(Ingredient.name)
        private readonly ingredientModel: Model<IngredientDocument>,
    ) { }

    async create(data: Partial<Ingredient>): Promise<Ingredient> {
        return this.ingredientModel.create(data);
    }

    async findById(id: Types.ObjectId | string) {
        return this.ingredientModel.findById(id).exec();
    }

    async findByMealId(mealId: string) {
        return this.ingredientModel
            .find({ mealId: new Types.ObjectId(mealId) })
            .exec();
    }

    async update(id: string, data: Partial<Ingredient>) {
        return this.ingredientModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }

    async delete(id: string): Promise<any> {
        return this.ingredientModel.deleteOne({ _id: id });
    }

}
