import { Injectable } from '@nestjs/common';
import { Calculation, CalculationDocument } from './schema/calculation.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';

@Injectable()
export class CalculationRepo {
  constructor(
    @InjectModel(Calculation.name)
    private calculationModel: Model<CalculationDocument>,
  ) {}

  async create(calculation: Calculation): Promise<Calculation> {
    return await this.calculationModel.create(calculation);
  }

  async findbyId(id: Types.ObjectId) {
    return this.calculationModel.findById(id);
  }

  async findByUserId(userId: Types.ObjectId) {
    return this.calculationModel.find({
      userId,
    });
  }

  async findTodayRecord(userId: Types.ObjectId) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.calculationModel.findOne({
      userId,
      createdAt: { $gte: start, $lte: end },
    });
  }

  async update(id: Types.ObjectId, data: Partial<Calculation>) {
    return this.calculationModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.calculationModel.deleteOne({ _id: id });
  }

  async getLatestRecord(userId: Types.ObjectId): Promise<CalculationDocument | null> {
    return this.calculationModel
      .findOne({
        userId,
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
