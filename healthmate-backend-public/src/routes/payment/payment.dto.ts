import { createZodDto } from 'nestjs-zod';
import { WebhookPaymentBodySchema } from './schema/request/payment.request.schema';

export class WebhookPaymentBodyDTO extends createZodDto(
  WebhookPaymentBodySchema,
) {}
