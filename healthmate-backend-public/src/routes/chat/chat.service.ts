import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom, ChatRoomDocument, Message, MessageDocument } from '../shared/schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoomDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // Create a new chat room
  async createChatRoom(customerId: string, expertId: string): Promise<ChatRoomDocument> {
    const roomId = `room_${customerId}_${expertId}`;
    
    // Check if room already exists
    const existingRoom = await this.chatRoomModel.findOne({ roomId }).exec();
    if (existingRoom) {
      return existingRoom;
    }

    const chatRoom = new this.chatRoomModel({
      roomId,
      customerId: new Types.ObjectId(customerId),
      expertId: new Types.ObjectId(expertId),
      status: 'active',
      lastMessageAt: new Date(),
    });

    return chatRoom.save();
  }

  // Get chat rooms for a user
  async getChatRooms(userId: string, userType: 'customer' | 'expert'): Promise<ChatRoomDocument[]> {
    const query = userType === 'customer' 
      ? { customerId: new Types.ObjectId(userId) }
      : { expertId: new Types.ObjectId(userId) };

    return this.chatRoomModel
      .find(query)
      .populate('customerId', 'fullname email')
      .populate('expertId', 'fullname email')
      .populate('lastMessageSender', 'fullname')
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  // Get messages for a chat room
  async getMessages(roomId: string, page: number = 1, limit: number = 50): Promise<MessageDocument[]> {
    const skip = (page - 1) * limit;
    
    return this.messageModel
      .find({ roomId })
      .populate('senderId', 'fullname email')
      .populate('receiverId', 'fullname email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  // Save a message
  async saveMessage(messageData: {
    roomId: string;
    senderId: string;
    receiverId: string;
    senderType: 'customer' | 'expert';
    content: string;
    messageType?: string;
  }): Promise<MessageDocument> {
    const message = new this.messageModel({
      ...messageData,
      senderId: new Types.ObjectId(messageData.senderId),
      receiverId: new Types.ObjectId(messageData.receiverId),
      timestamp: new Date(),
    });

    const savedMessage = await message.save();

    // Update chat room with last message info
    await this.chatRoomModel.findOneAndUpdate(
      { roomId: messageData.roomId },
      {
        lastMessage: messageData.content,
        lastMessageAt: savedMessage.timestamp,
        lastMessageSender: new Types.ObjectId(messageData.senderId),
        $inc: { unreadCount: 1 }
      }
    ).exec();

    return savedMessage.populate('senderId', 'fullname email');
  }

  // Mark messages as read
  async markAsRead(roomId: string, userId: string): Promise<void> {
    await this.messageModel.updateMany(
      { 
        roomId, 
        receiverId: new Types.ObjectId(userId),
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    ).exec();

    // Reset unread count for the room
    await this.chatRoomModel.findOneAndUpdate(
      { roomId },
      { unreadCount: 0 }
    ).exec();
  }

  // Get unread message count for a user
  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.messageModel.aggregate([
      {
        $match: {
          receiverId: new Types.ObjectId(userId),
          isRead: false
        }
      },
      {
        $count: 'count'
      }
    ]).exec();

    return result.length > 0 ? result[0].count : 0;
  }

  // Get available experts
  async getAvailableExperts(): Promise<any[]> {
    // This would typically query users with expert role
    // For now, return mock data or query users table
    return [
      {
        id: 'expert_1',
        name: 'Dr. Nutrition Expert',
        specialty: 'Nutrition & Dietetics',
        experience: 5,
        isOnline: true,
        rating: 4.8
      },
      {
        id: 'expert_2', 
        name: 'Dr. Health Specialist',
        specialty: 'Health & Wellness',
        experience: 3,
        isOnline: false,
        rating: 4.6
      }
    ];
  }

  // Delete a message
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message || message.senderId.toString() !== userId) {
      return false;
    }

    await this.messageModel.findByIdAndUpdate(messageId, {
      isDeleted: true,
      deletedAt: new Date()
    }).exec();

    return true;
  }

  // Get chat room by ID
  async getChatRoomById(roomId: string): Promise<ChatRoomDocument> {
    return this.chatRoomModel
      .findOne({ roomId })
      .populate('customerId', 'fullname email')
      .populate('expertId', 'fullname email')
      .exec();
  }

  // Update chat room status
  async updateChatRoomStatus(roomId: string, status: 'active' | 'closed' | 'waiting'): Promise<void> {
    await this.chatRoomModel.findOneAndUpdate(
      { roomId },
      { status }
    ).exec();
  }
}
