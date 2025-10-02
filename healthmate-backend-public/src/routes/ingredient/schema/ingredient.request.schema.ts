import z from 'zod';

export const IngredientCreateBodySchema = z
  .object({
    name: z.string().min(1),
    type: z.string().min(1),
    caloPer100g: z.number().nonnegative(),
    carbsPer100g: z.number().nonnegative(),
    proteinPer100g: z.number().nonnegative(),
    fatPer100g: z.number().nonnegative(),
    fiberPer100g: z.number().nonnegative(),
    sugarPer100g: z.number().nonnegative(),
  })
  .strict();

export const IngredientUpdateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    caloPer100g: z.number().nonnegative().optional(),
    carbsPer100g: z.number().nonnegative().optional(),
    proteinPer100g: z.number().nonnegative().optional(),
    fatPer100g: z.number().nonnegative().optional(),
    fiberPer100g: z.number().nonnegative().optional(),
    sugarPer100g: z.number().nonnegative().optional(),
  })
  .strict();

export const IngredientParamsSchema = z
  .object({
    ingredientId: z.string().min(1),
  })
  .strict();

export type IngredientCreateBodyType = z.infer<typeof IngredientCreateBodySchema>;
export type IngredientUpdateBodyType = z.infer<typeof IngredientUpdateBodySchema>;
export type IngredientParamsType = z.infer<typeof IngredientParamsSchema>;

