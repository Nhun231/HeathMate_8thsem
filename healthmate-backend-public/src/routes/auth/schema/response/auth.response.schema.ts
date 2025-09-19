import z from 'zod';
import { ObjectId } from 'mongodb';
import { Gender, UserStatus } from 'src/shared/constants/auth.constant';

export const UserSchema = z.object({
  _id: z.instanceof(ObjectId),
  email: z.email(),
  password: z.string().min(6),
  fullname: z.string().min(2),
  gender: z.enum([Gender.Male, Gender.Female]),
  dob: z.date().optional(),
  phoneNumber: z.string().optional(),
  avatar: z.string().optional(),
  role: z.instanceof(ObjectId),
  status: z
    .enum([UserStatus.Active, UserStatus.Inactive, UserStatus.Banned])
    .default(UserStatus.Active),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// export const RefreshTokenSchema = z.object({
//   token: z.string(),
//   userId: z.instanceof(ObjectId),
//   deviceId: z.instanceof(ObjectId),
//   expiresAt: z.date(),
//   createdAt: z.date(),
// });

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type UserType = z.infer<typeof UserSchema>;

export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>;

export type LoginResponseType = z.infer<typeof LoginResponseSchema>;

// export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;

export type RefreshTokenResponseType = z.infer<
  typeof RefreshTokenResponseSchema
>;
