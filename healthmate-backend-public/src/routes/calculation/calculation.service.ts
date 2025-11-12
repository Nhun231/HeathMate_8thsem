import { Injectable } from '@nestjs/common';
import { CalculationRepo } from './calculation.repo';
import { CalculationCreateType } from './schema/request/calculation.request.schema';
import {
  NotFoundCalculationException,
  NotFoundUserCalculationException,
} from './calculation.error';
import { Calculation } from './schema/calculation.schema';
import { DeleteResult, Types } from 'mongoose';
import { NutrientsCalculatorService } from 'src/shared/services/nutrients-calculator.service';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';

@Injectable()
export class CalculationService {
  constructor(
    private readonly calculationRepo: CalculationRepo,
    private readonly nutrientCalculatorService: NutrientsCalculatorService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async createCalculation({
    data,
    userId,
  }: {
    data: CalculationCreateType;
    userId: Types.ObjectId;
  }) {
    const calculation = this.calculate({ data, userId });

    // if there is a record for today, update the existing record
    const existingCalculation =
      await this.calculationRepo.findTodayRecord(userId);
    if (existingCalculation) {
      return this.update(existingCalculation._id.toString(), calculation);
    }

    // else create new record
    return this.calculationRepo.create(calculation);
  }

  calculate({
    data,
    userId,
  }: {
    data: CalculationCreateType;
    userId: Types.ObjectId;
  }) {
    const { age, gender, height, weight, activityLevel } = data;

    const { bmr, tdee, bmi, waterNeeded, protein, fat, carbs, fiber } =
      this.nutrientCalculatorService.calculateNutrients({
        age,
        gender,
        height,
        weight,
        activityLevel,
      });

    const calculation: Calculation = {
      userId,
      height,
      weight,
      activityLevel,
      bmr,
      tdee,
      bmi,
      waterNeeded,
      protein,
      fat,
      carbs,
      fiber,
    };

    return calculation;
  }

  async findById(id: string) {
    const calculationId = new Types.ObjectId(id);

    const calculation = await this.calculationRepo.findbyId(calculationId);
    if (!calculation) {
      throw NotFoundCalculationException;
    }

    return calculation;
  }

  async findByUserId(userId: Types.ObjectId) {
    const calculation = await this.calculationRepo.findByUserId(userId);
    if (!calculation) {
      throw NotFoundUserCalculationException;
    }
    return this.calculationRepo.findByUserId(userId);
  }

  async update(id: string, data: Partial<Omit<Calculation, 'userId'>>) {
    await this.findById(id);

    return this.calculationRepo.update(new Types.ObjectId(id), data);
  }

  async delete(id: string): Promise<DeleteResult> {
    await this.findById(id);

    return this.calculationRepo.delete(new Types.ObjectId(id));
  }

  // Find lastest calculation record by userId
  async findLatestByUserId(userId: Types.ObjectId) {
    return this.calculationRepo.findLatestByUserId(userId);
  }

  async updateNutrient(
    userId: Types.ObjectId,
    data: { protein?: number; fat?: number; carbs?: number; fiber?: number }) {
    //Give the lastest calculation record
    const latest = await this.findLatestByUserId(userId);
    if (!latest) {
      throw NotFoundCalculationException;
    }

    //Update nutrient
    const updated = await this.calculationRepo.update(latest._id, {
      protein: data.protein ?? latest.protein,
      fat: data.fat ?? latest.fat,
      carbs: data.carbs ?? latest.carbs,
      fiber: data.fiber ?? latest.fiber,
    });
    return updated;
  }

}
