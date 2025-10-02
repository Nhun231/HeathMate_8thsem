import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeleteResult } from 'mongodb';
import { Meal, MealDocument, MealType } from './schema/meal.schema';

@Injectable()
export class MealRepo {
  constructor(
    @InjectModel(Meal.name) private mealModel: Model<MealDocument>,
  ) {}

  async create(meal: Partial<Meal>): Promise<MealDocument> {
    return await this.mealModel.create(meal);
  }

  async findById(id: Types.ObjectId): Promise<MealDocument | null> {
    return this.mealModel.findById(id).exec();
  }

  async findByUserIdAndDate(
    userId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
    mealType?: MealType,
  ): Promise<MealDocument[]> {
    const filter: any = {
      userId,
      date: { $gte: startDate, $lt: endDate },
    };

    if (mealType) {
      filter.mealType = mealType;
    }

    return this.mealModel
      .find(filter)
      .populate('dishId', 'name')
      .populate('ingredientId', 'name')
      .sort({ mealType: 1, createdAt: 1 })
      .exec();
  }

  async findByUserIdAndDateRange(
    userId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<MealDocument[]> {
    return this.mealModel
      .find({
        userId,
        date: { $gte: startDate, $lt: endDate },
      })
      .exec();
  }

  async update(
    id: Types.ObjectId,
    data: Partial<Meal>,
  ): Promise<MealDocument | null> {
    return this.mealModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.mealModel.deleteOne({ _id: id }).exec();
  }

  async findByUserId(userId: Types.ObjectId): Promise<MealDocument[]> {
    return this.mealModel.find({ userId }).exec();
  }

  async getLatestRecord(userId: Types.ObjectId): Promise<MealDocument | null> {
    return this.mealModel
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('dishId', 'name')
      .populate('ingredientId', 'name')
      .exec();
  }
}
