import { Types } from 'mongoose';
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
    role: z.array(z.instanceof(Types.ObjectId)).optional(),
  })
  .strict();

export const UpdatePermissionBodySchema = CreatePermissionBodySchema.partial();

export const BulkUpdatePermissionBodySchema = z.object({
  updates: z.array(
    z.object({
      permissionId: z.string(),
      roleIds: z.array(z.string()),
    }),
  ),
});

export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>;

export type CreatePermissionBodyType = z.infer<
  typeof CreatePermissionBodySchema
>;

export type UpdatePermissionBodyType = z.infer<
  typeof UpdatePermissionBodySchema
>;

export type BulkUpdatePermissionBodyType = z.infer<
  typeof BulkUpdatePermissionBodySchema
>;
