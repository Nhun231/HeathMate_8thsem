import { createZodDto } from 'nestjs-zod';
import { UpdateUserBodySchema } from './schema/request/profile.request.schema';

export class UpdateUserProfileBodyDTO extends createZodDto(
  UpdateUserBodySchema,
) {}
