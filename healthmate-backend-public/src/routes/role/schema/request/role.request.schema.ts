import z from 'zod';

export const GetRoleParamsSchema = z
  .object({
    roleId: z.string(),
  })
  .strict();

export const CreateRoleBodySchema = z
  .object({
    name: z.string().max(500),
    description: z.string().optional(),
  })
  .strict();

export const UpdateRoleBodySchema = CreateRoleBodySchema.partial();

export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>;

export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>;

export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>;
