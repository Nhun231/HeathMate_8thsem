import { createZodDto } from 'nestjs-zod';
import {
  LoginBodySchema,
  LoginResponseSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOTPBodySchema,
} from './auth.model';

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResponseDTO extends createZodDto(RegisterResponseSchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class LoginResponseDTO extends createZodDto(LoginResponseSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
