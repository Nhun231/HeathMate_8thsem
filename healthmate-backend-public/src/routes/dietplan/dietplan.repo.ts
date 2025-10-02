import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DietPlan, DietPlanDocument } from './schema/dietplan.schema';

@Injectable()
export class DietPlanRepo {
  constructor(
    @InjectModel(DietPlan.name)
    private readonly dietPlanModel: Model<DietPlanDocument>,
  ) {}

  async create(data: Partial<DietPlan>): Promise<DietPlan> {
    return this.dietPlanModel.create(data);
  }

  async findById(id: Types.ObjectId) {
    return this.dietPlanModel.findById(id);
  }

  async findCurrentByUserId(userId: Types.ObjectId) {
    const today = new Date();
    return this.dietPlanModel
      .findOne({
        userId,
        startDate: { $lte: today },
        $or: [{ endDate: { $gte: today } }, { endDate: null }],
      })
      .sort({ startDate: -1 });
  }

  async findByDate(userId: Types.ObjectId, date: Date) {
    return this.dietPlanModel
      .findOne({
        userId,
        startDate: { $lte: date },
        $or: [{ endDate: { $gte: date } }, { endDate: null }],
      })
      .sort({ startDate: -1 });
  }

  async findAllByUserId(userId: Types.ObjectId) {
    return this.dietPlanModel.find({ userId }).sort({ startDate: -1 });
  }

  async update(id: Types.ObjectId, data: Partial<DietPlan>) {
    return this.dietPlanModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
  }
}
