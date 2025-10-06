import { HTTPMethod } from 'src/shared/constants/role.constant';
import z from 'zod';

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.string(),
  })
  .strict();

export const CreatePermissionBodySchema = z
  .object({
    name: z.string().max(500),
    description: z.string().optional(),
    module: z.string().max(500),
    path: z.string().max(1000),
    method: z.enum([
      HTTPMethod.GET,
      HTTPMethod.POST,
      HTTPMethod.PUT,
      HTTPMethod.DELETE,
      HTTPMethod.PATCH,
      HTTPMethod.OPTIONS,
      HTTPMethod.HEAD,
    ]),
  })
  .strict();

export const UpdatePermissionBodySchema = CreatePermissionBodySchema;

export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>;

export type CreatePermissionBodyType = z.infer<
  typeof CreatePermissionBodySchema
>;

export type UpdatePermissionBodyType = z.infer<
  typeof UpdatePermissionBodySchema
>;
