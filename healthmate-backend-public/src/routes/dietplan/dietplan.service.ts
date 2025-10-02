import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DietPlanRepo } from './dietplan.repo';
import { CalculationRepo } from '../calculation/calculation.repo';
import {
  NotFoundUserCalculationException,
  NotFoundDietPlanException,
  InvalidTargetWeightChangeException,
} from './dietplan.error';
import {
  DietPlanCreateBodyType,
  DietPlanUpdateBodyType,
} from './schema/request/dietplan.request.schema';

@Injectable()
export class DietPlanService {
  constructor(
    private readonly dietPlanRepo: DietPlanRepo,
    private readonly calculationRepo: CalculationRepo,
  ) {}

  async generateDietPlan(data: DietPlanCreateBodyType, userId: string) {
    if (!userId) throw new UnauthorizedException('Invalid token');
    const userObjectId = new Types.ObjectId(userId);

    const { goal, targetWeightChange } = data;

    // Get all calculations of the user
    const allCalculations =
      await this.calculationRepo.findByUserId(userObjectId);
    if (!allCalculations || allCalculations.length === 0) {
      throw NotFoundUserCalculationException;
    }

    // Get the latest calculation
    const latestCalc = allCalculations.sort(
      (a, b) => b._id.getTimestamp().getTime() - a._id.getTimestamp().getTime(),
    )[0];

    const TDEE = latestCalc.tdee;
    const currentWeight = latestCalc.weight;

    // Calculate diet plan details
    const { dailyCalories, durationDays, endDate } =
      this.calculateDietPlanDetails({
        TDEE,
        goal,
        targetWeightChange,
        currentWeight,
      });

    // Check if there's an existing current plan
    const existingPlan =
      await this.dietPlanRepo.findCurrentByUserId(userObjectId);

    if (existingPlan) {
      // If exists, update
      return this.dietPlanRepo.update(existingPlan._id, {
        goal,
        targetWeightChange:
          goal === 'MaintainWeight' ? undefined : targetWeightChange,
        dailyCalories,
        durationDays,
        startDate: new Date(),
        endDate: goal === 'MaintainWeight' ? undefined : (endDate ?? undefined),
        referenceTDEE: TDEE,
      });
    } else {
      //If not, create new
      return this.dietPlanRepo.create({
        userId: userObjectId,
        goal,
        targetWeightChange:
          goal === 'MaintainWeight' ? undefined : targetWeightChange,
        dailyCalories,
        durationDays,
        startDate: new Date(),
        endDate: goal === 'MaintainWeight' ? undefined : (endDate ?? undefined),
        referenceTDEE: TDEE,
      });
    }
  }

  async updateDietPlan(data: DietPlanUpdateBodyType, userId: string) {
    if (!userId) throw new UnauthorizedException('Invalid token');
    const userObjectId = new Types.ObjectId(userId);

    const { goal, targetWeightChange } = data;

    const existingPlan =
      await this.dietPlanRepo.findCurrentByUserId(userObjectId);
    if (!existingPlan) throw new NotFoundDietPlanException();

    // Get all calculations of the user
    const allCalculations =
      await this.calculationRepo.findByUserId(userObjectId);
    if (!allCalculations || allCalculations.length === 0) {
      throw new NotFoundUserCalculationException();
    }

    // Get the latest calculation
    const latestCalc = allCalculations.sort(
      (a, b) => b._id.getTimestamp().getTime() - a._id.getTimestamp().getTime(),
    )[0];

    const TDEE = latestCalc.tdee;
    const currentWeight = latestCalc.weight;
    const newGoal = goal || existingPlan.goal;

    const { dailyCalories, durationDays, endDate } =
      this.calculateDietPlanDetails({
        TDEE,
        goal: newGoal,
        targetWeightChange,
        currentWeight,
      });

    return this.dietPlanRepo.update(existingPlan._id, {
      goal: newGoal,
      targetWeightChange:
        newGoal === 'MaintainWeight' ? undefined : targetWeightChange,
      dailyCalories,
      durationDays: newGoal === 'MaintainWeight' ? 0 : durationDays,
      endDate:
        newGoal === 'MaintainWeight' ? undefined : (endDate ?? undefined),
      referenceTDEE: TDEE,
    });
  }

  async getCurrentDietPlan(userId: string) {
    if (!userId) throw new UnauthorizedException('Invalid token');
    const userObjectId = new Types.ObjectId(userId);

    const plan = await this.dietPlanRepo.findCurrentByUserId(userObjectId);
    if (!plan) throw new NotFoundDietPlanException();
    return plan;
  }

  async getDietPlanByDate(userId: string, date: string) {
    if (!userId) throw new UnauthorizedException('Invalid token');
    const userObjectId = new Types.ObjectId(userId);

    const dateToFind = new Date(`${date}T23:59:59.000Z`);
    const plan = await this.dietPlanRepo.findByDate(userObjectId, dateToFind);
    if (!plan) throw new NotFoundDietPlanException();
    return plan;
  }

  private calculateDietPlanDetails({
    TDEE,
    goal,
    targetWeightChange,
    currentWeight,
  }: {
    TDEE: number;
    goal: string;
    targetWeightChange?: number; 
    currentWeight: number;
  }) {
    let dailyCalories = TDEE;
    let durationDays = 0;
    let endDate: Date | null = null;

    if (goal === 'MaintainWeight') {
      dailyCalories = TDEE;
    } else if (goal === 'LoseWeight' || goal === 'GainWeight') {
      if (!targetWeightChange || targetWeightChange <= 0) {
        throw new InvalidTargetWeightChangeException();
      }
      if (goal === 'LoseWeight' && targetWeightChange >= currentWeight) {
        throw new InvalidTargetWeightChangeException();
      }
      if (goal === 'GainWeight' && targetWeightChange <= currentWeight) {
        throw new InvalidTargetWeightChangeException();
      }

      const actualWeightChange = targetWeightChange - currentWeight;

      const totalKcal = Math.abs(actualWeightChange) * 7000;      // 1kg = 7000 kcal
      const maxCalGap = 500;
      const kcalGap = Math.min(maxCalGap, Math.round(totalKcal / 30)); // try to spread over at least 30 days if possible

      dailyCalories = goal === 'LoseWeight' ? TDEE - kcalGap : TDEE + kcalGap;
      durationDays = Math.ceil(totalKcal / kcalGap); // if maxCalGap > totalKcal / 30 then duration is 30, else kcalGap=maxCalGap then the duration is > 30

      endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
    }

    return {
      dailyCalories: Math.round(dailyCalories),
      durationDays: goal === 'MaintainWeight' ? 0 : durationDays,
      endDate: goal === 'MaintainWeight' ? undefined : endDate,
    };
  }
}
