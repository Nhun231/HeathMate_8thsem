import { createZodDto } from 'nestjs-zod';
import {
  GenerateQRCodeSchema,
  WebhookPaymentBodySchema,
} from './schema/request/payment.request.schema';

export class WebhookPaymentBodyDTO extends createZodDto(
  WebhookPaymentBodySchema,
) {}

export class GenerateQRCodeDTO extends createZodDto(GenerateQRCodeSchema) {}
