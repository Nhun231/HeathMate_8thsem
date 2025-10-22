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
    origin: ['http://localhost:3000', 'http://localhost:3001'],
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

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove user from connected users map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
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
      senderName: string;
      content: string;
      type: string;
      timestamp: string;
    }
  ) {
    try {
      // Save message to database
      const message = await this.chatService.saveMessage({
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderType: data.senderId.startsWith('expert_') ? 'expert' : 'customer',
        content: data.content,
        messageType: data.type || 'text',
      });

      // Emit message to both sender and receiver
      const messageData = {
        id: message._id.toString(),
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderName: data.senderName,
        content: data.content,
        timestamp: data.timestamp,
        type: data.type || 'text',
      };

      // Send to sender
      client.emit('new_message', messageData);
      
      // Send to receiver
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('new_message', messageData);
      }

      this.logger.log(`Message sent from ${data.senderId} to ${data.receiverId}`);
    } catch (error) {
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

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const { roomId } = data;
    await client.join(`room_${roomId}`);
    this.logger.log(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const { roomId } = data;
    await client.leave(`room_${roomId}`);
    this.logger.log(`Client ${client.id} left room ${roomId}`);
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
