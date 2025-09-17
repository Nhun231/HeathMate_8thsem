import {
  Gender,
  TypeOfVerificationCode,
} from 'src/shared/constants/auth.constant';
import z from 'zod';

export const RegisterBodySchema = z
  .object({
    email: z.email(),
    password: z.string().min(6).max(64),
    confirmPassword: z.string().min(6).max(64),
    code: z.string().length(6),
    fullname: z.string().min(2).max(64),
    gender: z.enum([Gender.Male, Gender.Female, Gender.Other]),
    dob: z.coerce.date(),
    phoneNumber: z.string(),
  })
  .strict()
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export const LoginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(64),
});

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export const LogOutBodySchema = RefreshTokenBodySchema;

export const SendOTPBodySchema = z
  .object({
    email: z.email(),
    type: z.enum([
      TypeOfVerificationCode.REGISTER,
      TypeOfVerificationCode.FORGOT_PASSWORD,
    ]),
  })
  .strict();

export const ForgotPasswordBodySchema = z
  .object({
    email: z.email(),
    code: z.string().length(6),
    newPassword: z.string().min(6).max(64),
    confirmNewPassword: z.string().min(6).max(64),
  })
  .strict()
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
      });
    }
  });

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export type LoginBodyType = z.infer<typeof LoginBodySchema>;

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;

export type LogOutBodyType = z.infer<typeof LogOutBodySchema>;

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>;
