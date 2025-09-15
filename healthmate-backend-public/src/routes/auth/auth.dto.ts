import { createZodDto } from 'nestjs-zod';
import {
  ForgotPasswordBodySchema,
  GetAuthorizationUrlResponseSchema,
  LoginBodySchema,
  LoginResponseSchema,
  LogOutBodySchema,
  RefreshTokenBodySchema,
  RefreshTokenResponseSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOTPBodySchema,
} from './auth.model';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResponseDTO extends createZodDto(RegisterResponseSchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class LoginResponseDTO extends createZodDto(LoginResponseSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResponseDTO extends createZodDto(
  RefreshTokenResponseSchema,
) {}

export class LogOutBodyDTO extends createZodDto(LogOutBodySchema) {}

export class ForgotPasswordBodyDTO extends createZodDto(
  ForgotPasswordBodySchema,
) {}

export class GetAuthorizationUrlResponseDTO extends createZodDto(
  GetAuthorizationUrlResponseSchema,
) {}
