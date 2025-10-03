import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meal, MealDocument } from './schema/meal.schema';

@Injectable()
export class MealRepo {
    constructor(
        @InjectModel(Meal.name)
        private readonly mealModel: Model<MealDocument>,
    ) { }

    async create(data: Partial<Meal>): Promise<Meal> {
        return this.mealModel.create(data);
    }

    async findById(id: Types.ObjectId | string) {
        return this.mealModel.findById(id).exec();
    }

    async findByUserAndDate(userId: string, date: Date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        return this.mealModel
            .find({
                userId: new Types.ObjectId(userId),
                createdAt: { $gte: start, $lte: end },
            })
            .exec();
    }

    async findByUser(userId: string) {
        return this.mealModel
            .find({ userId: new Types.ObjectId(userId) })
            .exec();
    }

    async update(id: string, data: Partial<Meal>) {
        return this.mealModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }

    async delete(id: string): Promise<any> {
        return this.mealModel.deleteOne({ _id: id });
    }

}
