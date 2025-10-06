import { HTTPMethod } from 'src/shared/constants/role.constant';
import z from 'zod';

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number(),
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

export type GetPermissionParams = z.infer<typeof GetPermissionParamsSchema>;

export type CreatePermissionBody = z.infer<typeof CreatePermissionBodySchema>;

export type UpdatePermissionBody = z.infer<typeof UpdatePermissionBodySchema>;
