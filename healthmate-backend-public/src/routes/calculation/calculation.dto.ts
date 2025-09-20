import { createZodDto } from 'nestjs-zod';
import {
  CalculationCreateBodySchema,
  GetCalculationParamsSchema,
  GetCalculationUserParamsSchema,
} from './schema/request/calculation.request.schema';

export class CreateCalculationBodyDTO extends createZodDto(
  CalculationCreateBodySchema,
) {}

export class GetCalculationParamsDTO extends createZodDto(
  GetCalculationParamsSchema,
) {}

export class GetCalculationUserParamsDTO extends createZodDto(
  GetCalculationUserParamsSchema,
) {}

export class DeleteCalculationParamsDTO extends createZodDto(
  GetCalculationParamsSchema,
) {}
