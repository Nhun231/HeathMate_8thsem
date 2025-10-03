import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeleteResult } from 'mongodb';
import { Dish, DishDocument } from './schema/dish.schema';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';

@Injectable()
export class DishRepo {
  constructor(
    @InjectModel(Dish.name) private dishModel: Model<DishDocument>,
  ) { }

  async create(dish: Partial<Dish>): Promise<DishDocument> {
    return await this.dishModel.create(dish);
  }

  async findById(id: Types.ObjectId): Promise<DishDocument | null> {
    return this.dishModel.findById(id).populate('ingredients.ingredient').exec();
  }

  async findAll(): Promise<DishDocument[]> {
    return this.dishModel.find().populate('ingredients.ingredient').exec();
  }

  async findAllPaginated(
    page: number,
    limit: number,
    filter: any = {},
    search?: string,
  ): Promise<PaginatedResult<DishDocument>> {
    const skip = (page - 1) * limit;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.dishModel
        .find(filter)
        .populate('ingredients.ingredient')
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .exec(),
      this.dishModel.countDocuments(filter),
    ]);

    return {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(userId: Types.ObjectId): Promise<DishDocument[]> {
    return this.dishModel
      .find({ createdBy: userId })
      .populate('ingredients.ingredient')
      .exec();
  }

  async findByUserIdPaginated(
    userId: Types.ObjectId,
    page: number,
    limit: number,
    filter: any = {},
    search?: string,
  ): Promise<PaginatedResult<DishDocument>> {
    const skip = (page - 1) * limit;
    filter.createdBy = userId;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.dishModel
        .find(filter)
        .populate('ingredients.ingredient')
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .exec(),
      this.dishModel.countDocuments(filter),
    ]);

    return {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: Types.ObjectId,
    data: Partial<Dish>,
  ): Promise<DishDocument | null> {
    return this.dishModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('ingredients.ingredient')
      .exec();
  }

  async delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.dishModel.deleteOne({ _id: id }).exec();
  }

  async countDocuments(filter: any = {}): Promise<number> {
    return this.dishModel.countDocuments(filter).exec();
  }

  async findByIngredientId(ingredientId: Types.ObjectId): Promise<DishDocument[]> {
    return this.dishModel
      .find({ 'ingredients.ingredient': ingredientId })
      .exec();
  }

  async getLatestRecord(userId: Types.ObjectId): Promise<DishDocument | null> {
    return this.dishModel
      .findOne({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate('ingredients.ingredient')
      .exec();
  }
}
