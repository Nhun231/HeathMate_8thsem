import { createZodDto } from 'nestjs-zod';
import {
  ForgotPasswordBodySchema,
  LoginBodySchema,
  LogOutBodySchema,
  RefreshTokenBodySchema,
  RegisterBodySchema,
  SendOTPBodySchema,
} from './schema/request/auth.request.schema';
import { GetAuthorizationUrlResponseSchema } from './schema/response/auth.response.schema';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class LogOutBodyDTO extends createZodDto(LogOutBodySchema) {}

export class ForgotPasswordBodyDTO extends createZodDto(
  ForgotPasswordBodySchema,
) {}

export class GetAuthorizationUrlResponseDTO extends createZodDto(
  GetAuthorizationUrlResponseSchema,
) {}
