import { createZodDto } from 'nestjs-zod';
import { DishCreateBodySchema, DishParamsSchema, DishUpdateBodySchema } from './schema/dish.request.schema';

export class CreateDishBodyDTO extends createZodDto(DishCreateBodySchema) {}

export class UpdateDishBodyDTO extends createZodDto(DishUpdateBodySchema) {}

export class DishParamsDTO extends createZodDto(DishParamsSchema) {}
