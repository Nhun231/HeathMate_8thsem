import { createZodDto } from 'nestjs-zod';
import {
  AddDishToMealSchema,
  AddIngredientToMealSchema,
  GetMealsSchema,
  MealParamsSchema,
  UpdateMealSchema,
} from './schema/request/meal.request.schema';

export class AddDishToMealDto extends createZodDto(AddDishToMealSchema) {}

export class AddIngredientToMealDto extends createZodDto(AddIngredientToMealSchema) {}

export class GetMealsDto extends createZodDto(GetMealsSchema) {}

export class MealParamsDto extends createZodDto(MealParamsSchema) {}

export class UpdateMealDto extends createZodDto(UpdateMealSchema) {}
