import { createZodDto } from 'nestjs-zod';
import {
  CreatePostSchema,
  GetPostDetailParamsSchema,
  UpdatePostSchema,
} from './schema/request/post.request.schema';

export class GetPostDetailParamsDTO extends createZodDto(
  GetPostDetailParamsSchema,
) {}

export class CreatePostDTO extends createZodDto(CreatePostSchema) {}

export class UpdatePostDTO extends createZodDto(UpdatePostSchema) {}
