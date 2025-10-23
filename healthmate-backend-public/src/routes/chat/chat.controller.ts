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
    @Query('userType') userType: 'Customer' | 'NutrientExpert' = 'Customer'
  ) {
    try {
      const rooms = await this.chatService.getChatRooms(userId, userType);
      const mappedRooms = rooms.map(room => ({
        roomId: (room.roomId || room._id).toString(), // Use roomId if exists, otherwise use _id
        customerId: room.customerId,
        expertId: room.expertId,
        status: room.status,
        lastMessageAt: room.lastMessageAt,
        lastMessage: room.lastMessage,
        unreadCount: room.unreadCount,
        lastMessageTime: room.lastMessageAt
      }));
      return { rooms: mappedRooms };
    } catch (error) {
      console.error('❌ Controller: Error getting chat rooms:', error);
      throw error;
    }
  }

  // Get messages for a specific chat room
  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50
  ) {
    const messages = await this.chatService.getMessages(roomId, page, limit);
    return { 
      messages: messages.map(msg => ({
        id: msg._id,
        roomId: msg.roomId,
        senderId: (msg.senderId as any)._id || msg.senderId,
        receiverId: (msg.receiverId as any)._id || msg.receiverId,
        content: msg.content,
        timestamp: msg.timestamp,
        messageType: msg.messageType,
        isRead: msg.isRead,
        senderName: (msg.senderId as any)?.fullname || 'Unknown User'
      }))
    };
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
    const senderType = (roleName === 'NutritionExpert' || roleName === 'Admin') ? 'NutrientExpert' : 'Customer';
    
    try {
      const message = await this.chatService.saveMessage({
        ...messageData,
        senderId: userId,
        senderType,
      });

      return { message };
    } catch (error) {
      console.error('❌ Error saving message:', error);
      throw error;
    }
  }

  // Create a new chat room
  @Post('rooms')
  async createChatRoom(
    @Body() body: { participantId: string },
    @ActiveUser('userId') userId: string,
    @ActiveUser('roleName') roleName: string
  ) {
    // Determine customer and expert based on role
    let customerId: string;
    let expertId: string;
    
    if (roleName === 'NutritionExpert' || roleName === 'Admin') {
      // Expert is creating room with customer
      expertId = userId;
      customerId = body.participantId;
    } else {
      // Customer is creating room with expert
      customerId = userId;
      expertId = body.participantId;
    }
    
    const room = await this.chatService.createChatRoom(customerId, expertId);
    return { 
      room: {
        roomId: (room.roomId || room._id).toString(), // Use roomId if exists, otherwise use _id
        customerId: room.customerId,
        expertId: room.expertId,
        status: room.status,
        lastMessageAt: room.lastMessageAt,
        lastMessage: room.lastMessage,
        unreadCount: room.unreadCount
      }
    };
  }

  // Get available users to chat with
  @Get('available-users')
  async getAvailableUsers(
    @ActiveUser('userId') userId: string,
    @ActiveUser('roleName') roleName: string
  ) {
    // If user is expert, get their customers
    if (roleName === 'NutritionExpert' || roleName === 'Admin') {
      const users = await this.chatService.getAvailableCustomers(userId);
      return { users };
    } else {
      // If user is customer, get their experts
      const users = await this.chatService.getAvailableExperts(userId);
      return { users };
    }
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

  // Get chat room statistics
  @Get('rooms/:roomId/stats')
  async getChatRoomStats(@Param('roomId') roomId: string) {
    const stats = await this.chatService.getChatRoomStats(roomId);
    if (!stats) {
      return { error: 'Chat room not found' };
    }
    return { stats };
  }

  // Search messages in a room
  @Get('rooms/:roomId/search')
  async searchMessages(
    @Param('roomId') roomId: string,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    const messages = await this.chatService.searchMessages(roomId, query, page, limit);
    return { messages };
  }

  // Get chat room history for admin
  @Get('admin/history')
  async getChatRoomHistory(@Query('limit') limit: number = 50) {
    const history = await this.chatService.getChatRoomHistory(limit);
    return { history };
  }

  // Get active chat rooms count
  @Get('admin/active-count')
  async getActiveChatRoomsCount() {
    const count = await this.chatService.getActiveChatRoomsCount();
    return { count };
  }

  // Archive chat room
  @Patch('rooms/:roomId/archive')
  async archiveChatRoom(@Param('roomId') roomId: string) {
    await this.chatService.archiveChatRoom(roomId);
    return { success: true };
  }

  // Get expert status
  @Get('experts/:expertId/status')
  async getExpertStatus(@Param('expertId') expertId: string) {
    const status = await this.chatService.getExpertStatus(expertId);
    return { status };
  }
}
