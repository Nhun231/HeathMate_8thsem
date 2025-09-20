import { Types } from 'mongoose';
import { ActivityLevel } from 'src/shared/constants/auth.constant';
import z from 'zod';

export const CalculationCreateBodySchema = z
  .object({
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

export const GetCalculationParamsSchema = z
  .object({
    calculationId: z.string(),
  })
  .strict();

export const GetCalculationUserParamsSchema = z.object({
  userId: z.instanceof(Types.ObjectId),
});

export const DeleteCalculationParamsSchema = GetCalculationParamsSchema;

export type CalculationCreateType = z.infer<typeof CalculationCreateBodySchema>;

export type GetCalculationParamsType = z.infer<
  typeof GetCalculationParamsSchema
>;

export type GetCalculationUserParamsType = z.infer<
  typeof GetCalculationUserParamsSchema
>;

export type DeleteCalculationParamsType = z.infer<
  typeof DeleteCalculationParamsSchema
>;
