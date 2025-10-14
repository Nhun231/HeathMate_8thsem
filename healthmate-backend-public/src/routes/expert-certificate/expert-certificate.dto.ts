import { createZodDto } from 'nestjs-zod';
import {
  CreateCertificateBodySchema,
  DeleteCertificateParamsSchema,
  GetCertificateParamsSchema,
  UpdateCertificateBodySchema,
} from './schema/request/expert-certificate.request.schema';

export class CreateCertificateBodyDto extends createZodDto(
  CreateCertificateBodySchema,
) {}

export class GetCertificateParamsDto extends createZodDto(
  GetCertificateParamsSchema,
) {}

export class UpdateCertificateBodyDto extends createZodDto(
  UpdateCertificateBodySchema,
) {}

export class DeleteCertificateParamsDto extends createZodDto(
  DeleteCertificateParamsSchema,
) {}
