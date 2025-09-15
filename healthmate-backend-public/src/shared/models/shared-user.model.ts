import z from 'zod';
import { ActivityLevel, Gender, UserStatus } from '../constants/auth.constant';

export const UserSchema = z.object({
  id: z.number().positive(),
  email: z.email(),
  password: z.string(),
  status: z.enum([UserStatus.Active, UserStatus.Inactive, UserStatus.Banned]),
  roleId: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type UserType = z.infer<typeof UserSchema>;

export const UserProfile = z.object({
  id: z.number().positive(),
  userId: z.number().positive(),
  fullname: z.string().nullable(),
  gender: z.enum([Gender.Male, Gender.Female, Gender.Other]).nullable(),
  dob: z.date().nullable(),
  height: z.float64().positive().nullable(),
  weight: z.float64().positive().nullable(),
  avatar: z.string().nullable(),
  activityLevel: z
    .enum([
      ActivityLevel.Sedentary,
      ActivityLevel.Light,
      ActivityLevel.Moderate,
      ActivityLevel.Active,
      ActivityLevel.VeryActive,
    ])
    .nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type UserProfileType = z.infer<typeof UserProfile>;
