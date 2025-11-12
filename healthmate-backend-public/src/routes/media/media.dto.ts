import { createZodDto } from 'nestjs-zod';
import { PresignedUploadFileBodySchema } from './schema/request/media.request.schema';
import {
  PresignedUploadFileResponseSchema,
  UploadFilesResponseSchema,
} from './schema/response/media.response.schema';

export class PresignedUploadFileBodyDTO extends createZodDto(
  PresignedUploadFileBodySchema,
) {}

export class UploadFilesResponseDTO extends createZodDto(
  UploadFilesResponseSchema,
) {}

export class PresignedUploadFileResponseDTO extends createZodDto(
  PresignedUploadFileResponseSchema,
) {}
