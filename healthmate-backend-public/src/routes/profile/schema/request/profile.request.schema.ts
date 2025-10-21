import { Gender } from 'src/shared/constants/auth.constant';
import z from 'zod';

export const GetUserProfileParamsSchema = z.object({
  userId: z.string(),
});

export const UpdateUserBodySchema = z.object({
  fullname: z.string().min(2).max(64).optional(),
  gender: z.enum([Gender.Male, Gender.Female]).optional(),
  dob: z.coerce.date().optional(),
  phoneNumber: z.string().optional(),
  avatar: z.string().optional(),
});

export type GetUserProfileParamsType = z.infer<
  typeof GetUserProfileParamsSchema
>;
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>;
