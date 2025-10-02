import { createZodDto } from 'nestjs-zod';
import {
  EmptyBodySchema,
  QuerySchema,
} from '../schemas/request/request.schema';

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
export class QueryDTO extends createZodDto(QuerySchema) {}
