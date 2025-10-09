import { createZodDto } from 'nestjs-zod';
import { PaginateSchema } from '../schemas/paginate.schema';

export class PaginateDto extends createZodDto(PaginateSchema) {}
