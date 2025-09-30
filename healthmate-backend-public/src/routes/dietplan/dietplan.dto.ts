import { createZodDto } from 'nestjs-zod';
import {
  DietPlanCreateBodySchema,
  DietPlanUpdateBodySchema,
  GetDietPlanByDateQuerySchema,
} from './schema/request/dietplan.request.schema';

export class CreateDietPlanBodyDTO extends createZodDto(
  DietPlanCreateBodySchema,
) {}
export class UpdateDietPlanBodyDTO extends createZodDto(
  DietPlanUpdateBodySchema,
) {}
export class GetDietPlanByDateQueryDTO extends createZodDto(
  GetDietPlanByDateQuerySchema,
) {}
