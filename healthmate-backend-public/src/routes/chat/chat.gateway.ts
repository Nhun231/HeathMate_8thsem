import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  },
  namespace: '/v1/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {
    this.logger.log('ChatGateway initialized');
  }

  // Gateway lifecycle method
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized on namespace /v1/chat');
  }

  // Connection handler
  handleConnection(client: Socket) {
    client.emit('connection_confirmed', { 
      message: 'Connected to chat server',
      clientId: client.id,
      timestamp: new Date().toISOString()
    });
  }

  // Disconnection handler
  handleDisconnect(client: Socket) {
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

  @SubscribeMessage('test_connection')
  async handleTestConnection(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any
  ) {

    client.emit('test_response', {
      message: 'Connection test successful',
      clientId: client.id,
      timestamp: new Date().toISOString()
    });
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
      // Save message to database first
      
      const savedMessage = await this.chatService.saveMessage({
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        messageType: data.messageType || 'text',
      });
      
      // Create message object for broadcasting using saved message data
      const messageData = {
        id: savedMessage._id?.toString() || `msg_${Date.now()}`,
        roomId: data.roomId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        messageType: data.messageType || 'text',
        timestamp: savedMessage.timestamp.toISOString(),
        isRead: false,
      };

      // Broadcast to all users in the room
      this.server.to(`room_${data.roomId}`).emit('new_message', messageData);
      
      // Also send to specific users to ensure delivery
      const senderSocketId = this.connectedUsers.get(data.senderId);
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      
      // Send to receiver directly if they're connected
      if (receiverSocketId && receiverSocketId !== client.id) {
        this.server.to(receiverSocketId).emit('new_message', messageData);
      }
      
      // Send to sender for confirmation (if different from current client)
      if (senderSocketId && senderSocketId !== client.id) {
        this.server.to(senderSocketId).emit('new_message', messageData);
      }
    } catch (error) {
      
      this.logger.error('Error sending message:', error);
      client.emit('message_error', { 
        error: 'Failed to send message', 
        details: error.message,
        type: error.name || 'Unknown'
      });
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
    // Store user connection
    this.connectedUsers.set(userId, client.id);
    
    // Join the specific chat room
    await client.join(`room_${roomId}`);
    // Also join user-specific room for notifications
    await client.join(`user_${userId}`);

    // Check how many users are in this room
    const roomClients = await this.server.in(`room_${roomId}`).fetchSockets();
    roomClients.forEach(socket => {
    });
    
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
