import { createZodDto } from 'nestjs-zod';
import {
  CreateSubscriptionSchema,
  DeleteSubscriptionSchema,
  GetSubscriptionParamsSchema,
  UpdateSubscriptionSchema,
} from './schema/request/subscription.request.schema';

export class GetSubscriptionParamsDTO extends createZodDto(
  GetSubscriptionParamsSchema,
) {}

export class CreateSubscriptionBodyDTO extends createZodDto(
  CreateSubscriptionSchema,
) {}

export class UpdateSubscriptionBodyDTO extends createZodDto(
  UpdateSubscriptionSchema,
) {}

export class DeleteSubscriptionDTO extends createZodDto(
  DeleteSubscriptionSchema,
) {}
