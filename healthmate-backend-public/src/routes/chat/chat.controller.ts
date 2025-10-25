import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Types } from 'mongoose';
import {
  SendMessageBodyDTO,
  CreateChatRoomBodyDTO,
  GetMessagesQueryDTO,
  GetChatRoomsQueryDTO,
  RoomParamsDTO,
  MarkAsReadBodyDTO,
} from './chat.dto';

@Controller('v1/chat')

export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  // Get chat rooms for current user
  @Get('rooms')
  async getChatRooms(
    @ActiveUser('userId') userId: Types.ObjectId,
    @Query() query: GetChatRoomsQueryDTO
  ) {
    const rooms = await this.chatService.getChatRooms(userId, query.userType);
    return { rooms };
  }

  // Get messages for a specific chat room
  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param() params: RoomParamsDTO,
    @Query() query: GetMessagesQueryDTO
  ) {
    const messages = await this.chatService.getMessages(params.roomId, query.page, query.limit);
    return { messages };
  }

  // Send a message
  @Post('messages')
  async sendMessage(
    @Body() messageData: SendMessageBodyDTO,
    @ActiveUser('userId') userId: Types.ObjectId
  ) {
    const message = await this.chatService.saveMessage({
      ...messageData,
      senderId: userId.toString(),
    });

    return { message };
  }

  // Create a new chat room
  @Post('rooms')
  async createChatRoom(
    @Body() body: CreateChatRoomBodyDTO,
    @ActiveUser('userId') userId: Types.ObjectId
  ) {
    // For simplicity, assume the current user is always the client
    // and participantId is the expert
    const room = await this.chatService.createChatRoom(userId.toString(), body.participantId);
    
    // Transform response to include roomId
    const roomObj = room.toObject();
    const transformedRoom = {
      ...roomObj,
      roomId: (room._id as Types.ObjectId).toString(),
      customerId: room.customerId,
      expertId: room.expertId,
    };
    
    return { room: transformedRoom };
  }

  // Get available users to chat with
  @Get('available-users')
  async getAvailableUsers(@ActiveUser('userId') userId: Types.ObjectId, @ActiveUser() user: any) {
    console.log('🔍 Getting available users for user:', {
      userId: userId.toString(),
      userRole: user?.roleId?.name,
      userEmail: user?.email,
      fullUser: user
    });
    
    // Determine if user is Customer or Expert
    const userRole = user?.roleId?.name;
    
    let users;
    if (userRole === 'Customer') {
      console.log('👤 User is Customer, getting experts...');
      users = await this.chatService.getAvailableExperts(userId.toString());
    } else if (userRole === 'NutritionExpert' || userRole === 'NutrientExpert') {
      console.log('👨‍⚕️ User is Expert, getting customers...');
      users = await this.chatService.getAvailableCustomers(userId.toString());
    } else {
      console.log('❓ Unknown user role, defaulting to get experts');
      users = await this.chatService.getAvailableExperts(userId.toString());
    }
    
    console.log('🔍 Found users for role', userRole, ':', users.length);
    return { users };
  }

  // Mark messages as read
  @Patch('rooms/:roomId/read')
  async markAsRead(
    @Param() params: RoomParamsDTO,
    @Body() body: MarkAsReadBodyDTO,
    @ActiveUser('userId') userId: Types.ObjectId
  ) {
    await this.chatService.markAsRead(params.roomId, userId.toString());
    return { success: true };
  }

  // Get chat room details
  @Get('rooms/:roomId')
  async getChatRoom(@Param() params: RoomParamsDTO) {
    const room = await this.chatService.getChatRoomById(params.roomId);
    return { room };
  }
}