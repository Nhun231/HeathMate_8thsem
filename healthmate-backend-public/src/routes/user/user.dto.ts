import { createZodDto } from 'nestjs-zod';
import {
  CreateUserSchema,
  DeleteUserSchema,
  GetUserDetailParamsSchema,
  UpdateUserSchema,
} from './schema/request/user.request.schema';

export class GetUserDetailParamsDTO extends createZodDto(
  GetUserDetailParamsSchema,
) {}

export class CreateUserDTO extends createZodDto(CreateUserSchema) {}

export class UpdateUserDTO extends createZodDto(UpdateUserSchema) {}

export class DeleteUserDTO extends createZodDto(DeleteUserSchema) {}
