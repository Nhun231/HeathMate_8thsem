import z from 'zod';

export const DishIngredientSchema = z.object({
    ingredient: z.string().min(1),
    amount: z.number().positive(),
    unit: z.string().min(1).default('g'),
}).strict();

export const DishCreateBodySchema = z
    .object({
        name: z.string().min(1),
        description: z.string().min(1),
        type: z.string().min(1),
        servings: z.number().positive(),
        ingredients: z.array(DishIngredientSchema).min(1),
    })
    .strict();

export const DishUpdateBodySchema = z
    .object({
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        type: z.string().min(1).optional(),
        servings: z.number().positive().optional(),
        ingredients: z.array(DishIngredientSchema).min(1).optional(),
    })
    .strict();

export const DishParamsSchema = z
    .object({
        dishId: z.string().min(1),
    })
    .strict();

export type DishIngredientType = z.infer<typeof DishIngredientSchema>;
export type DishCreateBodyType = z.infer<typeof DishCreateBodySchema>;
export type DishUpdateBodyType = z.infer<typeof DishUpdateBodySchema>;
export type DishParamsType = z.infer<typeof DishParamsSchema>;
