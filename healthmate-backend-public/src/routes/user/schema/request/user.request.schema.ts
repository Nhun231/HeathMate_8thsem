import { Types } from 'mongoose';
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
  roleId: z.instanceof(Types.ObjectId),
});

export const UpdateUserSchema = z.object({
  fullname: z.string().min(2).max(64),
  gender: z.enum([Gender.Male, Gender.Female]),
  dob: z.coerce.date(),
  phoneNumber: z.string(),
  roleId: z.instanceof(Types.ObjectId),
  status: z.enum([UserStatus.Active, UserStatus.Inactive, UserStatus.Banned]),
});

export const DeleteUserSchema = z.object({
  id: z.string(),
});

export type GetUserDetailParamsType = z.infer<typeof GetUserDetailParamsSchema>;

export type CreateUserType = z.infer<typeof CreateUserSchema>;

export type UpdateUserType = z.infer<typeof UpdateUserSchema>;
