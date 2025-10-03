import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meal, MealDocument, MealType } from './schema/meal.schema';
import { Dish, DishDocument } from '../dish/schema/dish.schema';
import { Ingredient, IngredientDocument } from '../ingredient/schema/ingredient.schema';
import { AddDishToMealDto, AddIngredientToMealDto, GetMealsDto, UpdateMealDto } from './meal.dto';
import { MealNotFoundError, MealForbiddenError } from './meal.error';
import { MealRepo } from './meal.repo';

@Injectable()
export class MealService {
  constructor(
    private readonly mealRepo: MealRepo,
    @InjectModel(Dish.name) private dishModel: Model<DishDocument>,
    @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>,
  ) {}

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new MealNotFoundError('Invalid ID format');
    }
  }

  async addDishToMeal(
    userId: string,
    date: Date,
    mealType: MealType,
    addDishDto: AddDishToMealDto,
  ): Promise<MealDocument> {
    try {
      this.validateObjectId(addDishDto.dishId);
      
      // Get dish information
      const dish = await this.dishModel.findById(addDishDto.dishId).exec();
      if (!dish) {
        throw new MealNotFoundError('Dish not found');
      }

      // Calculate nutrition values based on quantity
      const factor = addDishDto.quantity / 100; // assuming quantity is in grams
      const nutrition = {
        calories: (dish.totalCalories || 0) * factor,
        protein: (dish.totalProtein || 0) * factor,
        fat: (dish.totalFat || 0) * factor,
        carbs: (dish.totalCarbs || 0) * factor,
        fiber: (dish.totalFiber || 0) * factor,
        sugar: (dish.totalSugar || 0) * factor,
      };

      const mealData = {
        userId: new Types.ObjectId(userId),
        date,
        mealType,
        dishId: new Types.ObjectId(addDishDto.dishId),
        quantity: addDishDto.quantity,
        isIngredient: false,
        ...nutrition,
      };

      return await this.mealRepo.create(mealData);
    } catch (error) {
      if (error instanceof MealNotFoundError) {
        throw error;
      }
      console.error('[MealService.addDishToMeal] Unexpected error:', error);
      throw new Error('Failed to add dish to meal');
    }
  }

  async addIngredientToMeal(
    userId: string,
    date: Date,
    mealType: MealType,
    addIngredientDto: AddIngredientToMealDto,
  ): Promise<MealDocument> {
    try {
      this.validateObjectId(addIngredientDto.ingredientId);
      
      // Get ingredient information
      const ingredient = await this.ingredientModel.findById(addIngredientDto.ingredientId).exec();
      if (!ingredient) {
        throw new MealNotFoundError('Ingredient not found');
      }

      // Calculate nutrition values based on quantity
      const factor = addIngredientDto.quantity / 100; // assuming quantity is in grams
      const nutrition = {
        calories: (ingredient.caloPer100g || 0) * factor,
        protein: (ingredient.proteinPer100g || 0) * factor,
        fat: (ingredient.fatPer100g || 0) * factor,
        carbs: (ingredient.carbsPer100g || 0) * factor,
        fiber: (ingredient.fiberPer100g || 0) * factor,
        sugar: (ingredient.sugarPer100g || 0) * factor,
      };

      const mealData = {
        userId: new Types.ObjectId(userId),
        date,
        mealType,
        ingredientId: new Types.ObjectId(addIngredientDto.ingredientId),
        quantity: addIngredientDto.quantity,
        isIngredient: true,
        ...nutrition,
      };

      return await this.mealRepo.create(mealData);
    } catch (error) {
      if (error instanceof MealNotFoundError) {
        throw error;
      }
      console.error('[MealService.addIngredientToMeal] Unexpected error:', error);
      throw new Error('Failed to add ingredient to meal');
    }
  }

  async getMeals(userId: string, getMealsDto: GetMealsDto): Promise<MealDocument[]> {
    try {
      const startDate = new Date(getMealsDto.date);
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // next day
      console.log(startDate,"-",endDate)
      return await this.mealRepo.findByUserIdAndDate(
        new Types.ObjectId(userId),
        startDate,
        endDate,
        getMealsDto.mealType,
      );
    } catch (error) {
      console.error('[MealService.getMeals] Unexpected error:', error);
      throw new Error('Failed to fetch meals');
    }
  }

  async updateMeal(userId: string, mealId: string, updateMealDto: UpdateMealDto): Promise<MealDocument> {
    try {
      this.validateObjectId(mealId);
      
      const meal = await this.mealRepo.findById(new Types.ObjectId(mealId));
      if (!meal) {
        throw new MealNotFoundError('Meal not found');
      }

      // Check if user owns this meal
      if (String(meal.userId) !== String(userId)) {
        throw new MealForbiddenError('Cannot update meal you do not own');
      }

      if (updateMealDto.quantity !== undefined) {
        // Recalculate nutrition based on new quantity
        const factor = updateMealDto.quantity / 100;
        
        if (meal.isIngredient && meal.ingredientId) {
          const ingredient = await this.ingredientModel.findById(meal.ingredientId).exec();
          if (ingredient) {
            meal.calories = (ingredient.caloPer100g || 0) * factor;
            meal.protein = (ingredient.proteinPer100g || 0) * factor;
            meal.fat = (ingredient.fatPer100g || 0) * factor;
            meal.carbs = (ingredient.carbsPer100g || 0) * factor;
            meal.fiber = (ingredient.fiberPer100g || 0) * factor;
            meal.sugar = (ingredient.sugarPer100g || 0) * factor;
          }
        } else if (meal.dishId) {
          const dish = await this.dishModel.findById(meal.dishId).exec();
          if (dish) {
            meal.calories = (dish.totalCalories || 0) * factor;
            meal.protein = (dish.totalProtein || 0) * factor;
            meal.fat = (dish.totalFat || 0) * factor;
            meal.carbs = (dish.totalCarbs || 0) * factor;
            meal.fiber = (dish.totalFiber || 0) * factor;
            meal.sugar = (dish.totalSugar || 0) * factor;
          }
        }
        
        meal.quantity = updateMealDto.quantity;
      }

      const updatedMeal = await this.mealRepo.update(new Types.ObjectId(mealId), meal);
      if (!updatedMeal) {
        throw new MealNotFoundError('Failed to update meal');
      }
      return updatedMeal;
    } catch (error) {
      if (error instanceof MealNotFoundError || error instanceof MealForbiddenError) {
        throw error;
      }
      console.error('[MealService.updateMeal] Unexpected error:', error);
      throw new Error('Failed to update meal');
    }
  }

  async deleteMeal(userId: string, mealId: string): Promise<void> {
    try {
      this.validateObjectId(mealId);
      
      const meal = await this.mealRepo.findById(new Types.ObjectId(mealId));
      if (!meal) {
        throw new MealNotFoundError('Meal not found');
      }

      // Check if user owns this meal
      if (String(meal.userId) !== String(userId)) {
        throw new MealForbiddenError('Cannot delete meal you do not own');
      }

      await this.mealRepo.delete(new Types.ObjectId(mealId));
    } catch (error) {
      if (error instanceof MealNotFoundError || error instanceof MealForbiddenError) {
        throw error;
      }
      console.error('[MealService.deleteMeal] Unexpected error:', error);
      throw new Error('Failed to delete meal');
    }
  }

  async getMealSummary(userId: string, date: string): Promise<{
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    totalFiber: number;
    totalSugar: number;
    mealsByType: Record<MealType, MealDocument[]>;
  }> {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const meals = await this.mealRepo.findByUserIdAndDateRange(
        new Types.ObjectId(userId),
        startDate,
        endDate,
      );

      const summary = {
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
        totalFiber: 0,
        totalSugar: 0,
        mealsByType: {
          [MealType.BREAKFAST]: [] as MealDocument[],
          [MealType.LUNCH]: [] as MealDocument[],
          [MealType.DINNER]: [] as MealDocument[],
          [MealType.SNACK]: [] as MealDocument[],
        },
      };

      meals.forEach((meal) => {
        summary.totalCalories += meal.calories;
        summary.totalProtein += meal.protein;
        summary.totalFat += meal.fat;
        summary.totalCarbs += meal.carbs;
        summary.totalFiber += meal.fiber;
        summary.totalSugar += meal.sugar;
        summary.mealsByType[meal.mealType].push(meal);
      });

      return summary;
    } catch (error) {
      console.error('[MealService.getMealSummary] Unexpected error:', error);
      throw new Error('Failed to get meal summary');
    }
  }
}
