import z from 'zod';

export const GetSubscriptionParamsSchema = z.object({
  subId: z.string(),
});

export const CreateSubscriptionSchema = z.object({
  name: z.string(),
  type: z.string(),
  durationDays: z.number(),
  price: z.number(),
});

export const UpdateSubscriptionSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  durationDays: z.number().optional(),
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
