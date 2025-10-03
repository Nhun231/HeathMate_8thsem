import { Injectable, Logger } from '@nestjs/common';
import { MealRepo } from '../meal/meal.repo';
import { MealType } from '../meal/schema/meal.schema';
import dayjs from 'dayjs';

interface DiaryMealItem {
    mealId: string;
    mealType: MealType;
    isIngredient: boolean;
    refId: string;
    quantity: number;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sugar: number;
}

interface DiarySummary {
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    totalFiber: number;
    totalSugar: number;
}

@Injectable()
export class FoodDiaryService {
    private readonly logger = new Logger(FoodDiaryService.name);

    constructor(private readonly mealRepo: MealRepo) { }

    async getDiaryByDate(userId: string, dateStr?: string): Promise<any> {
        const date = dateStr ? dayjs(dateStr).startOf('day') : dayjs().startOf('day');
        const start = date.toDate();

        const meals = await this.mealRepo.findByUserAndDate(userId, start);

        if (!meals || meals.length === 0) {
            return {
                date: date.format('YYYY-MM-DD'),
                meals: [],
                summary: {
                    totalCalories: 0,
                    totalProtein: 0,
                    totalFat: 0,
                    totalCarbs: 0,
                    totalFiber: 0,
                    totalSugar: 0,
                },
            };
        }

        const diaryMeals: DiaryMealItem[] = [];
        const summary: DiarySummary = {
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            totalFiber: 0,
            totalSugar: 0,
        };

        for (const meal of meals) {
            const mealItem: DiaryMealItem = {
                mealId: String(meal._id),
                mealType: meal.mealType,
                isIngredient: meal.isIngredient,
                refId: meal.isIngredient ? String(meal.ingredientId) : String(meal.dishId),
                quantity: meal.quantity,
                calories: meal.calories,
                protein: meal.protein,
                fat: meal.fat,
                carbs: meal.carbs,
                fiber: meal.fiber,
                sugar: meal.sugar,
            };

            diaryMeals.push(mealItem);

            summary.totalCalories += meal.calories;
            summary.totalProtein += meal.protein;
            summary.totalFat += meal.fat;
            summary.totalCarbs += meal.carbs;
            summary.totalFiber += meal.fiber;
            summary.totalSugar += meal.sugar;
        }

        return {
            date: date.format('YYYY-MM-DD'),
            meals: diaryMeals,
            summary,
        };
    }
}
