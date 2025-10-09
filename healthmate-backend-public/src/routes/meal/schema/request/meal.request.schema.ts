import z from 'zod';
import { MealType } from '../meal.schema';

export const AddDishToMealSchema = z
  .object({
    dishId: z.string().min(1),
    quantity: z.number().min(0),
  })
  .strict();

export const AddIngredientToMealSchema = z
  .object({
    ingredientId: z.string().min(1),
    quantity: z.number().min(0),
  })
  .strict();

export const GetMealsSchema = z
  .object({
    date: z.string().datetime(),
    mealType: z.enum([
      MealType.BREAKFAST,
      MealType.LUNCH,
      MealType.DINNER,
      MealType.SNACK,
    ]).optional(),
  })
  .strict();

export const MealParamsSchema = z
  .object({
    mealId: z.string().min(1),
  })
  .strict();

export const UpdateMealSchema = z
  .object({
    quantity: z.number().min(0).optional(),
  })
  .strict();

export type AddDishToMealType = z.infer<typeof AddDishToMealSchema>;
export type AddIngredientToMealType = z.infer<typeof AddIngredientToMealSchema>;
export type GetMealsType = z.infer<typeof GetMealsSchema>;
export type MealParamsType = z.infer<typeof MealParamsSchema>;
export type UpdateMealType = z.infer<typeof UpdateMealSchema>;
