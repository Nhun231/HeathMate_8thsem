import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MealService } from './meal.service';
import { ActiveUser } from '../../shared/decorators/active-user.decorator';
import { Types } from 'mongoose';
import { AddDishToMealDto, AddIngredientToMealDto, GetMealsDto, MealParamsDto, UpdateMealDto } from './meal.dto';
import { MealType } from './schema/meal.schema';

@Controller('v1/meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Post('/dish')
  async addDishToMeal(
    @Body() body: AddDishToMealDto,
    @ActiveUser('userId') userId: Types.ObjectId,
    @Query('date') date: string,
    @Query('mealType') mealType: MealType,
  ) {
    return this.mealService.addDishToMeal(
      String(userId),
      new Date(date),
      mealType,
      body,
    );
  }

  @Post('/ingredient')
  async addIngredientToMeal(
    @Body() body: AddIngredientToMealDto,
    @ActiveUser('userId') userId: Types.ObjectId,
    @Query('date') date: string,
    @Query('mealType') mealType: MealType,
  ) {
    return this.mealService.addIngredientToMeal(
      String(userId),
      new Date(date),
      mealType,
      body,
    );
  }

  @Get()
  async getMeals(
    @Query() query: GetMealsDto,
    @ActiveUser('userId') userId: Types.ObjectId,
  ) {
    return this.mealService.getMeals(String(userId), query);
  }

  @Get('/summary')
  async getMealSummary(
    @Query('date') date: string,
    @ActiveUser('userId') userId: Types.ObjectId,
  ) {
    return this.mealService.getMealSummary(String(userId), date);
  }

  @Patch(':mealId')
  async updateMeal(
    @Param() params: MealParamsDto,
    @Body() body: UpdateMealDto,
    @ActiveUser('userId') userId: Types.ObjectId,
  ) {
    return this.mealService.updateMeal(String(userId), params.mealId, body);
  }

  @Delete(':mealId')
  async deleteMeal(
    @Param() params: MealParamsDto,
    @ActiveUser('userId') userId: Types.ObjectId,
  ) {
    await this.mealService.deleteMeal(String(userId), params.mealId);
  }
}
