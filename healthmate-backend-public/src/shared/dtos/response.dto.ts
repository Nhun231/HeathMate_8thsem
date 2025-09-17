import { createZodDto } from 'nestjs-zod';
import { MessageResponseSchema } from '../schemas/response/response.schema';

export class MessageResponseDTO extends createZodDto(MessageResponseSchema) {}
