import { Injectable } from '@nestjs/common';
import { ActivityLevel, Gender } from '../constants/auth.constant';
import {
  InvalidActivityLevelException,
  InvalidGenderException,
} from '../utils/error';

@Injectable()
export class NutrientsCalculatorService {
  calculateNutrients({
    height,
    weight,
    gender,
    age,
    activityLevel,
  }: {
    height: number;
    weight: number;
    gender: string;
    age: number;
    activityLevel: string;
  }) {
    const bmr = this.calculateBMR({ gender, age, weight, height });
    const tdee = this.calculateTDEE({ bmr, activityLevel });
    const bmi = this.calculateBMI({ height, weight });
    const waterNeeded = +(weight * 0.03).toFixed(2);
    const nutrition = this.calculateNutrition(tdee);

    const data = {
      bmr,
      tdee,
      bmi,
      waterNeeded,
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbs: nutrition.carbs,
      fiber: nutrition.fiber,
    };

    return data;
  }

  calculateBMR({
    gender,
    age,
    weight,
    height,
  }: {
    gender: string;
    age: number;
    weight: number;
    height: number;
  }) {
    let bmr = 0;
    if (gender === Gender.Male) {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === Gender.Female) {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      throw InvalidGenderException;
    }

    return bmr;
  }

  calculateTDEE({
    bmr,
    activityLevel,
  }: {
    bmr: number;
    activityLevel: string;
  }) {
    const activityFactors = {
      [ActivityLevel.Sedentary]: 1.2,
      [ActivityLevel.Light]: 1.375,
      [ActivityLevel.Moderate]: 1.55,
      [ActivityLevel.Active]: 1.725,
      [ActivityLevel.VeryActive]: 1.9,
    };

    const factor = activityFactors[activityLevel];
    if (!factor) {
      throw InvalidActivityLevelException;
    }

    const tdee = bmr * factor;

    return tdee;
  }

  calculateBMI({ height, weight }: { height: number; weight: number }) {
    return +(weight / Math.pow(height / 100, 2)).toFixed(2);
  }

  calculateNutrition(calories: number) {
    const proteinRatio = 0.25;
    const fatRatio = 0.25;
    const fiberRatio = 0.05;
    const carbsRatio = 1 - proteinRatio - fatRatio - fiberRatio;

    const proteinCalories = calories * proteinRatio;
    const fatCalories = calories * fatRatio;
    const fiberCalories = calories * fiberRatio;
    const carbsCalories = calories * carbsRatio;

    const proteinGrams = +(proteinCalories / 4).toFixed(2);
    const fatGrams = +(fatCalories / 9).toFixed(2);
    const fiberGrams = +(fiberCalories / 2).toFixed(2);
    const carbsGrams = +(carbsCalories / 4).toFixed(2);

    const result = {
      protein: proteinGrams,
      fat: fatGrams,
      fiber: fiberGrams,
      carbs: carbsGrams,
    };

    return result;
  }
}
