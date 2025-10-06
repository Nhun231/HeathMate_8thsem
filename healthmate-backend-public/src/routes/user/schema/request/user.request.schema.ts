import { Gender, UserStatus } from 'src/shared/constants/auth.constant';
import z from 'zod';

export const GetUserDetailParamsSchema = z.object({
  id: z.string(),
});

export const CreateUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(64),
  fullname: z.string().min(2).max(64),
  gender: z.enum([Gender.Male, Gender.Female]),
  dob: z.coerce.date(),
  phoneNumber: z.string(),
  role: z.string(),
});

export const UpdateUserSchema = z.object({
  fullname: z.string().min(2).max(64).optional(),
  gender: z.enum([Gender.Male, Gender.Female]).optional(),
  dob: z.coerce.date().optional(),
  phoneNumber: z.string().optional(),
  role: z.string().optional(),
  status: z
    .enum([UserStatus.Active, UserStatus.Inactive, UserStatus.Banned])
    .optional(),
});

export const DeleteUserSchema = GetUserDetailParamsSchema;

export type GetUserDetailParamsType = z.infer<typeof GetUserDetailParamsSchema>;

export type CreateUserType = z.infer<typeof CreateUserSchema>;

export type UpdateUserType = z.infer<typeof UpdateUserSchema>;

export type DeleteUserType = z.infer<typeof DeleteUserSchema>;
