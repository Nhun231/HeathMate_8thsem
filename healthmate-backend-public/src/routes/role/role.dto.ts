import { createZodDto } from 'nestjs-zod';
import {
  CreateRoleBodySchema,
  GetRoleParamsSchema,
  UpdateRoleBodySchema,
} from './schema/request/role.request.schema';

export class GetRoleParamsDTO extends createZodDto(GetRoleParamsSchema) {}

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}

export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}
