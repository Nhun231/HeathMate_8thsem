import { createZodDto } from 'nestjs-zod';
import { IngredientCreateBodySchema, IngredientParamsSchema, IngredientUpdateBodySchema } from './schema/ingredient.request.schema';

export class CreateIngredientBodyDTO extends createZodDto(IngredientCreateBodySchema) {}

export class UpdateIngredientBodyDTO extends createZodDto(IngredientUpdateBodySchema) {}

export class IngredientParamsDTO extends createZodDto(IngredientParamsSchema) {}


