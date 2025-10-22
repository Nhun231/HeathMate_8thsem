import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ActiveUser } from '../../shared/decorators/active-user.decorator';
import { Types } from 'mongoose';

@Controller('v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get chat rooms for current user
  @Get('rooms')
  async getChatRooms(
    @ActiveUser('userId') userId: string,
    @Query('userType') userType: 'customer' | 'expert' = 'customer'
  ) {
    const rooms = await this.chatService.getChatRooms(userId, userType);
    return { rooms };
  }

  // Get messages for a specific chat room
  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50
  ) {
    const messages = await this.chatService.getMessages(roomId, page, limit);
    return { messages };
  }

  // Send a message
  @Post('messages')
  async sendMessage(
    @Body() messageData: {
      roomId: string;
      receiverId: string;
      content: string;
      messageType?: string;
    },
    @ActiveUser('userId') userId: string,
    @ActiveUser('roleName') roleName: string
  ) {
    const senderType = roleName === 'Admin' ? 'expert' : 'customer';
    
    const message = await this.chatService.saveMessage({
      ...messageData,
      senderId: userId,
      senderType,
    });

    return { message };
  }

  // Create a new chat room
  @Post('rooms')
  async createChatRoom(
    @Body() body: { participantId: string },
    @ActiveUser('userId') userId: string
  ) {
    const room = await this.chatService.createChatRoom(userId, body.participantId);
    return { room };
  }

  // Get available users to chat with
  @Get('available-users')
  async getAvailableUsers() {
    const users = await this.chatService.getAvailableExperts();
    return { users };
  }

  // Mark messages as read
  @Patch('rooms/:roomId/read')
  async markAsRead(
    @Param('roomId') roomId: string,
    @ActiveUser('userId') userId: string
  ) {
    await this.chatService.markAsRead(roomId, userId);
    return { success: true };
  }

  // Get unread message count
  @Get('unread-count')
  async getUnreadCount(@ActiveUser('userId') userId: string) {
    const count = await this.chatService.getUnreadCount(userId);
    return { count };
  }

  // Delete a message
  @Delete('messages/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @ActiveUser('userId') userId: string
  ) {
    const success = await this.chatService.deleteMessage(messageId, userId);
    return { success };
  }

  // Get chat room details
  @Get('rooms/:roomId')
  async getChatRoom(@Param('roomId') roomId: string) {
    const room = await this.chatService.getChatRoomById(roomId);
    return { room };
  }

  // Update chat room status
  @Patch('rooms/:roomId/status')
  async updateChatRoomStatus(
    @Param('roomId') roomId: string,
    @Body() body: { status: 'active' | 'closed' | 'waiting' }
  ) {
    await this.chatService.updateChatRoomStatus(roomId, body.status);
    return { success: true };
  }
}
