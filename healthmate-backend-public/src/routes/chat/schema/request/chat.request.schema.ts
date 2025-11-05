import z from 'zod';

// Send message body schema
export const SendMessageBodySchema = z
  .object({
    roomId: z.string(),
    receiverId: z.string(),
    content: z.string().min(1, 'Content cannot be empty').max(2000, 'Content too long'),
    messageType: z.enum(['text', 'image', 'file']).optional().default('text'),
  })
  .strict();

// Create chat room body schema
export const CreateChatRoomBodySchema = z
  .object({
    participantId: z.string(),
  })
  .strict();

// Get messages query schema
export const GetMessagesQuerySchema = z
  .object({
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(1000),
  })
  .strict();

// Get chat rooms query schema
export const GetChatRoomsQuerySchema = z
  .object({
    userType: z.enum(['Customer', 'NutritionExpert']).optional().default('Customer'),
  })
  .strict();

// Room ID params schema
export const RoomParamsSchema = z
  .object({
    roomId: z.string(),
  })
  .strict();

// Mark as read body schema (could be expanded in the future)
export const MarkAsReadBodySchema = z
  .object({})
  .strict();

// Export types
export type SendMessageBodyType = z.infer<typeof SendMessageBodySchema>;
export type CreateChatRoomBodyType = z.infer<typeof CreateChatRoomBodySchema>;
export type GetMessagesQueryType = z.infer<typeof GetMessagesQuerySchema>;
export type GetChatRoomsQueryType = z.infer<typeof GetChatRoomsQuerySchema>;
export type RoomParamsType = z.infer<typeof RoomParamsSchema>;
export type MarkAsReadBodyType = z.infer<typeof MarkAsReadBodySchema>;
