import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger('ChatController');
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
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const participantId = body.participantId;
    this.logger.log(`createChatRoom requester=${userId?.toString()} participantId=${participantId}`);
    if (!Types.ObjectId.isValid(participantId)) {
      throw new BadRequestException('Invalid participantId');
    }
    const requesterId = userId.toString();
    if (requesterId === participantId) {
      throw new BadRequestException('participantId must be different from requester');
    }

    try {
      const room = await this.chatService.createChatRoom(requesterId, participantId);

      const roomObj = room.toObject();
      const transformedRoom = {
        ...roomObj,
        roomId: (room._id as Types.ObjectId).toString(),
        customerId: room.customerId,
        expertId: room.expertId,
      };

      return { room: transformedRoom };
    } catch (error) {
      this.logger.error(`createChatRoom failed: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  // Get available users to chat with
  @Get('available-users')
  async getAvailableUsers(@ActiveUser('userId') userId: Types.ObjectId, @ActiveUser() user: any) {
    // Determine if user is Customer or Expert
    const userRole = user?.roleId?.name;
    
    let users;
    if (userRole === 'Customer') {
      users = await this.chatService.getAvailableExperts(userId.toString());
    } else if (userRole === 'NutritionExpert' || userRole === 'NutrientExpert') {
      users = await this.chatService.getAvailableCustomers(userId.toString());
    } else {
      users = await this.chatService.getAvailableExperts(userId.toString());
    }
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