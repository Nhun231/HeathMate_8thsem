import { createZodDto } from 'nestjs-zod';
import {
  ChangePasswordBodySchema,
  UpdateUserBodySchema,
} from './schema/request/profile.request.schema';

export class UpdateUserProfileBodyDTO extends createZodDto(
  UpdateUserBodySchema,
) {}

export class ChangePasswordBodyDTO extends createZodDto(
  ChangePasswordBodySchema,
) {}
