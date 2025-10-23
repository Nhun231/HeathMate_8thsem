import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log('🔌 Socket: Client connected:', client.id);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log('🔌 Socket: Client disconnected:', client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove user from connected users map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        console.log('🔌 Socket: Removing user from connected users:', userId);
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join_user_room')
  async handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; userType: string }
  ) {
    const { userId, userType } = data;
    
    console.log('🔌 Socket: User joining room:', userId, 'as', userType);
    
    // Store user connection
    this.connectedUsers.set(userId, client.id);
    
    // Join user-specific room
    await client.join(`user_${userId}`);
    
    // Join general room based on user type
    if (userType === 'expert') {
      await client.join('experts');
    } else {
      await client.join('customers');
    }

    this.logger.log(`User ${userId} joined room as ${userType}`);
    
    // Notify others about user online status
    this.server.to('experts').emit('user_status', {
      userId,
      isOnline: true,
      userType
    });
    
    this.server.to('customers').emit('user_status', {
      userId,
      isOnline: true,
      userType
    });
  }

  @SubscribeMessage('join_expert_room')
  async handleJoinExpertRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { expertId: string }
  ) {
    const { expertId } = data;
    
    this.connectedUsers.set(expertId, client.id);
    await client.join(`expert_${expertId}`);
    await client.join('experts');
    
    this.logger.log(`Expert ${expertId} joined room`);
  }

  @SubscribeMessage('join_customer_room')
  async handleJoinCustomerRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { customerId: string }
  ) {
    const { customerId } = data;
    
    this.connectedUsers.set(customerId, client.id);
    await client.join(`customer_${customerId}`);
    await client.join('customers');
    
    this.logger.log(`Customer ${customerId} joined room`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      roomId: string;
      senderId: string;
      receiverId: string;
      content: string;
      messageType?: string;
    }
  ) {
    try {
      console.log('📤 Gateway: Received send_message event');
      console.log('📤 Gateway: Client ID:', client.id);
      console.log('📤 Gateway: Message data:', data);
      
      // Save message to database
      const message = await this.chatService.saveMessage({
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderType: 'NutrientExpert', // Assume expert for now, can be improved
        content: data.content,
        messageType: data.messageType || 'text',
      });

      console.log('💾 Gateway: Message saved to database:', message);

      // Emit message to the specific room
      const messageData = {
        id: message._id?.toString() || message.id,
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        messageType: data.messageType || 'text',
        timestamp: message.timestamp || new Date().toISOString(),
        isRead: false,
      };

      console.log('📡 Socket: Broadcasting to room:', `room_${data.roomId}`);
      
      // Broadcast to all users in the room
      this.server.to(`room_${data.roomId}`).emit('new_message', messageData);
      
      // Also send to specific users to ensure delivery
      const senderSocketId = this.connectedUsers.get(data.senderId);
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      
      console.log('📡 Socket: Sender socket:', senderSocketId, 'Receiver socket:', receiverSocketId);
      
      // Send to receiver directly if they're connected
      if (receiverSocketId && receiverSocketId !== client.id) {
        console.log('📡 Socket: Sending directly to receiver');
        this.server.to(receiverSocketId).emit('new_message', messageData);
      }
      
      // Send to sender for confirmation (if different from current client)
      if (senderSocketId && senderSocketId !== client.id) {
        console.log('📡 Socket: Sending confirmation to sender');
        this.server.to(senderSocketId).emit('new_message', messageData);
      }

      this.logger.log(`Message sent from ${data.senderId} to room ${data.roomId}`);
    } catch (error) {
      console.error('❌ Gateway: Error in handleSendMessage:', error);
      console.error('❌ Gateway: Error details:', error.message);
      console.error('❌ Gateway: Error stack:', error.stack);
      this.logger.error('Error sending message:', error);
      client.emit('message_error', { error: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId: string }
  ) {
    const { userId, roomId } = data;
    
    // Emit typing indicator to room participants
    this.server.to(`room_${roomId}`).emit('user_typing', {
      userId,
      roomId,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('stop_typing')
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; roomId: string }
  ) {
    const { userId, roomId } = data;
    
    // Emit stop typing indicator to room participants
    this.server.to(`room_${roomId}`).emit('user_stop_typing', {
      userId,
      roomId,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('mark_message_read')
  async handleMarkMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; roomId: string; userId: string }
  ) {
    try {
      const { messageId, roomId, userId } = data;
      
      // Mark message as read in database
      await this.chatService.markAsRead(roomId, userId);
      
      // Notify sender that message was read
      const senderSocketId = this.connectedUsers.get(userId);
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('message_read', {
          messageId,
          readBy: userId,
          readAt: new Date().toISOString()
        });
      }
      
      this.logger.log(`Message ${messageId} marked as read by ${userId}`);
    } catch (error) {
      this.logger.error('Error marking message as read:', error);
      client.emit('message_error', { error: 'Failed to mark message as read' });
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string }
  ) {
    const { roomId, userId } = data;
    
    console.log('🔌 Gateway: Received join_room event');
    console.log('🔌 Gateway: Client ID:', client.id);
    console.log('🔌 Gateway: Room ID:', roomId, 'User ID:', userId);
    
    // Store user connection
    this.connectedUsers.set(userId, client.id);
    
    // Join the specific chat room
    await client.join(`room_${roomId}`);
    
    // Also join user-specific room for notifications
    await client.join(`user_${userId}`);
    
    this.logger.log(`User ${userId} (${client.id}) joined room ${roomId}`);
    
    // Notify room participants about user joining
    this.server.to(`room_${roomId}`).emit('user_joined', {
      userId,
      roomId,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string }
  ) {
    const { roomId, userId } = data;
    
    // Leave the specific chat room
    await client.leave(`room_${roomId}`);
    
    this.logger.log(`User ${userId} (${client.id}) left room ${roomId}`);
    
    // Notify room participants about user leaving
    this.server.to(`room_${roomId}`).emit('user_left', {
      userId,
      roomId,
      timestamp: new Date().toISOString(),
    });
  }

  // Helper method to get connected users
  getConnectedUsers(): Map<string, string> {
    return this.connectedUsers;
  }

  // Helper method to check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
