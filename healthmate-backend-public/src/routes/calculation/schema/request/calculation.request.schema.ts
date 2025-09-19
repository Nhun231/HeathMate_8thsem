import { ActivityLevel, Gender } from 'src/shared/constants/auth.constant';
import z from 'zod';

export const CalculationCreateBodySchema = z
  .object({
    gender: z.enum([Gender.Male, Gender.Female]),
    age: z.number().positive(),
    height: z.number().positive(),
    weight: z.number().positive(),
    activityLevel: z.enum([
      ActivityLevel.Sedentary,
      ActivityLevel.Light,
      ActivityLevel.Moderate,
      ActivityLevel.Active,
      ActivityLevel.VeryActive,
    ]),
  })
  .strict();

export type CalculationCreateType = z.infer<typeof CalculationCreateBodySchema>;
