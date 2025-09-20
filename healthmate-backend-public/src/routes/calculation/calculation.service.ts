import { Injectable } from '@nestjs/common';
import { CalculationRepo } from './calculation.repo';
import { CalculationCreateType } from './schema/request/calculation.request.schema';
import { NotFoundUserCalculationException } from './calculation.error';
import { Calculation } from './schema/calculation.schema';
import { Types } from 'mongoose';
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
    const calculation = await this.calculate({ data, userId });

    // if there is a record for today, update the existing record
    const existingCalculation =
      await this.calculationRepo.findTodayRecord(userId);
    if (existingCalculation) {
      return this.update(existingCalculation._id.toString(), calculation);
    }

    // else create new record
    return this.calculationRepo.create(calculation);
  }

  async calculate({
    data,
    userId,
  }: {
    data: CalculationCreateType;
    userId: Types.ObjectId;
  }) {
    const { height, weight, activityLevel } = data;

    const userAge = await this.sharedUserRepository.getUserAge(userId);
    const user = await this.sharedUserRepository.findUnique({ _id: userId });

    if (!user) {
      throw NotFoundUserCalculationException;
    }
    const gender = user.gender;

    const { bmr, tdee, bmi, waterNeeded, protein, fat, carbs, fiber } =
      this.nutrientCalculatorService.calculateNutrients({
        gender,
        height,
        weight,
        age: userAge,
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

  findById(id: string) {
    const calculationId = new Types.ObjectId(id);
    return this.calculationRepo.findbyId(calculationId);
  }

  findByUserId(userId: Types.ObjectId) {
    return this.calculationRepo.findByUserId(userId);
  }

  update(id: string, data: Partial<Omit<Calculation, 'userId'>>) {
    const calculationId = new Types.ObjectId(id);
    return this.calculationRepo.update(calculationId, data);
  }
}
