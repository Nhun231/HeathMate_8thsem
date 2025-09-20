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
    return this.calculationModel.find({ userId });
  }

  async update(id: Types.ObjectId, data: Partial<Calculation>) {
    return this.calculationModel.updateOne({ _id: id }, { $set: data });
  }

  async delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.calculationModel.deleteOne({ _id: id });
  }
}
