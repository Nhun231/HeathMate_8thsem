import { createZodDto } from 'nestjs-zod';
import {
  CreatePermissionBodySchema,
  GetPermissionParamsSchema,
  UpdatePermissionBodySchema,
} from './schema/request/permission.request.schema';

export class GetPermissionParamsDTO extends createZodDto(
  GetPermissionParamsSchema,
) {}

export class CreatePermissionBodyDTO extends createZodDto(
  CreatePermissionBodySchema,
) {}

export class UpdatePermissionBodyDTO extends createZodDto(
  UpdatePermissionBodySchema,
) {}
