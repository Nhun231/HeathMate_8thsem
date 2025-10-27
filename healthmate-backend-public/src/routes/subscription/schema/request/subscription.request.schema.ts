import { SubscriptionType } from 'src/shared/constants/subscription.constant';
import z from 'zod';

export const GetSubscriptionParamsSchema = z.object({
  subId: z.string(),
});

export const CreateSubscriptionSchema = z.object({
  name: z.string(),
  type: z.enum([SubscriptionType.INDEPTH, SubscriptionType.ADVANCED]),
  duration: z.number(),
  price: z.number(),
});

export const UpdateSubscriptionSchema = z.object({
  name: z.string().optional(),
  type: z
    .enum([SubscriptionType.INDEPTH, SubscriptionType.ADVANCED])
    .optional(),
  duration: z.number().optional(),
  price: z.number().optional(),
});

export const DeleteSubscriptionSchema = GetSubscriptionParamsSchema;

export type GetSubscriptionParamsSchemaType = z.infer<
  typeof GetSubscriptionParamsSchema
>;

export type CreateSubscriptionSchemaType = z.infer<
  typeof CreateSubscriptionSchema
>;

export type UpdateSubscriptionSchemaType = z.infer<
  typeof UpdateSubscriptionSchema
>;

export type DeleteSubscriptionSchemaType = z.infer<
  typeof DeleteSubscriptionSchema
>;
