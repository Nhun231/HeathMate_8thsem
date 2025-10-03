import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Dish, DishDocument } from './schema/dish.schema';

@Injectable()
export class DishRepo {
    constructor(
        @InjectModel(Dish.name)
        private readonly dishModel: Model<DishDocument>,
    ) { }

    async create(data: Partial<Dish>): Promise<Dish> {
        return this.dishModel.create(data);
    }

    async findById(id: Types.ObjectId | string) {
        return this.dishModel.findById(id).exec();
    }

    async findByMealId(mealId: string) {
        return this.dishModel
            .find({ mealId: new Types.ObjectId(mealId) })
            .populate('ingredients.ingredient')
            .exec();
    }

    async update(id: string, data: Partial<Dish>) {
        return this.dishModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }

    async delete(id: string): Promise<any> {
        return this.dishModel.deleteOne({ _id: id });
    }

}
