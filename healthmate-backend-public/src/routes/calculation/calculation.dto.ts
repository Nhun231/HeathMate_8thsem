import { createZodDto } from 'nestjs-zod';
import { CalculationCreateBodySchema } from './schema/request/calculation.request.schema';

export class CreateCalculationBodyDTO extends createZodDto(
  CalculationCreateBodySchema,
) {}
