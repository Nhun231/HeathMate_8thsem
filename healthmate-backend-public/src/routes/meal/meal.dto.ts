import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MealType } from './schema/meal.schema';

export class AddDishToMealDto {
  @IsString()
  dishId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class AddIngredientToMealDto {
  @IsString()
  ingredientId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class GetMealsDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;
}

export class MealParamsDto {
  @IsString()
  mealId: string;
}

export class UpdateMealDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;
}
