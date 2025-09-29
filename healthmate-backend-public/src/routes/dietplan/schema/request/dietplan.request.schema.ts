import z from 'zod';
import { Goal } from 'src/shared/constants/goal.constant';

export const DietPlanCreateBodySchema = z
  .object({
    goal: z.enum([Goal.GainWeight, Goal.LoseWeight, Goal.MaintainWeight]),
    targetWeightChange: z.number().positive().optional(),
  })
  .strict();

export const DietPlanUpdateBodySchema = z
  .object({
    goal: z
      .enum([Goal.GainWeight, Goal.LoseWeight, Goal.MaintainWeight])
      .optional(),
    targetWeightChange: z.number().positive().optional(),
  })
  .strict();

export const GetDietPlanByDateQuerySchema = z
  .object({
    date: z.string().refine((value) => !isNaN(Date.parse(value))),
  })
  .strict();

export type DietPlanCreateBodyType = z.infer<
typeof DietPlanCreateBodySchema
>;

export type DietPlanUpdateBodyType = z.infer<
typeof DietPlanUpdateBodySchema
>;

export type GetDietPlanByDateQueryType = z.infer<
  typeof GetDietPlanByDateQuerySchema
>;
