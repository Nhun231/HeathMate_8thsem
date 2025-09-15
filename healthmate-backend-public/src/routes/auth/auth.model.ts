import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import { UserSchema } from 'src/shared/models/shared-user.model';
import z from 'zod';

// Register
export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(64),
    code: z.string().length(6),
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

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
});

// Login
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();
// .extend({
//   code: z.string().length(6).optional(), // Email OTP code
// })
// .strict();

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// Verification Code
export const VerificationCode = z.object({
  id: z.number().positive(),
  email: z.email(),
  code: z.string().min(6).max(6),
  type: z.enum([
    TypeOfVerificationCode.REGISTER,
    TypeOfVerificationCode.FORGOT_PASSWORD,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const SendOTPBodySchema = VerificationCode.pick({
  email: true,
  type: true,
}).strict();

// Role
export const RoleSchema = z.object({
  id: z.number().positive(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

// Device
export const DeviceSchema = z.object({
  id: z.number().positive(),
  userId: z.number().positive(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>;

export type LoginBodyType = z.infer<typeof LoginBodySchema>;

export type LoginResponseType = z.infer<typeof LoginResponseSchema>;

export type VerificationCodeType = z.infer<typeof VerificationCode>;

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;

export type DeviceType = z.infer<typeof DeviceSchema>;

export type RoleType = z.infer<typeof RoleSchema>;
