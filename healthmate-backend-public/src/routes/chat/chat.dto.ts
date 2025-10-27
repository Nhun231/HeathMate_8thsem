import { createZodDto } from 'nestjs-zod';
import {
  SendMessageBodySchema,
  CreateChatRoomBodySchema,
  GetMessagesQuerySchema,
  GetChatRoomsQuerySchema,
  RoomParamsSchema,
  MarkAsReadBodySchema,
} from './schema/request/chat.request.schema';

export class SendMessageBodyDTO extends createZodDto(SendMessageBodySchema) {}

export class CreateChatRoomBodyDTO extends createZodDto(CreateChatRoomBodySchema) {}

export class GetMessagesQueryDTO extends createZodDto(GetMessagesQuerySchema) {}

export class GetChatRoomsQueryDTO extends createZodDto(GetChatRoomsQuerySchema) {}

export class RoomParamsDTO extends createZodDto(RoomParamsSchema) {}

export class MarkAsReadBodyDTO extends createZodDto(MarkAsReadBodySchema) {}
