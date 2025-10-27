import z from 'zod';

export const GetOrderParamsSchema = z
  .object({
    orderId: z.string(),
  })
  .strict();

export const CreateOrderBodySchema = z
  .object({
    subscriptionId: z.string(),
  })
  .strict();

export const DeleteOrderSchema = GetOrderParamsSchema;

export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>;

export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>;

export type DeleteOrderType = z.infer<typeof DeleteOrderSchema>;
