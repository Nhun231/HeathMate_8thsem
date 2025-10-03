import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeleteResult } from 'mongodb';
import { Ingredient, IngredientDocument } from './schema/ingredient.schema';
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';

@Injectable()
export class IngredientRepo {
  constructor(
    @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>,
  ) { }

  async create(ingredient: Partial<Ingredient>): Promise<IngredientDocument> {
    return await this.ingredientModel.create(ingredient);
  }

  async insertMany(ingredients: Partial<Ingredient>[]): Promise<IngredientDocument[]> {
    return await this.ingredientModel.insertMany(ingredients) as IngredientDocument[];
  }

  async findById(id: Types.ObjectId): Promise<IngredientDocument | null> {
    return this.ingredientModel.findById(id).exec();
  }

  async findAll(): Promise<IngredientDocument[]> {
    return this.ingredientModel.find().exec();
  }

  async findAllPaginated(
    page: number,
    limit: number,
    filter: any = {},
    search?: string,
  ): Promise<PaginatedResult<IngredientDocument>> {
    const skip = (page - 1) * limit;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.ingredientModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.ingredientModel.countDocuments(filter),
    ]);

    return {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(userId: Types.ObjectId): Promise<IngredientDocument[]> {
    return this.ingredientModel.find({ belongsTo: userId }).exec();
  }

  async findByUserIdPaginated(
    userId: Types.ObjectId,
    page: number,
    limit: number,
    filter: any = {},
    search?: string,
  ): Promise<PaginatedResult<IngredientDocument>> {
    const skip = (page - 1) * limit;
    filter.belongsTo = userId;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.ingredientModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .exec(),
      this.ingredientModel.countDocuments(filter),
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
    data: Partial<Ingredient>,
  ): Promise<IngredientDocument | null> {
    return this.ingredientModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.ingredientModel.deleteOne({ _id: id }).exec();
  }

  async deleteMany(filter: any = {}): Promise<DeleteResult> {
    return this.ingredientModel.deleteMany(filter).exec();
  }

  async countDocuments(filter: any = {}): Promise<number> {
    return this.ingredientModel.countDocuments(filter).exec();
  }
}
