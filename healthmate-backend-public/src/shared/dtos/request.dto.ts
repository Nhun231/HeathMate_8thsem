import { createZodDto } from 'nestjs-zod';
import { EmptyBodySchema } from '../schemas/request/request.schema';

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
