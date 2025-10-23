import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {ChatRoom, ChatRoomDocument, Message, MessageDocument} from "../../shared/schemas/chat.schema";
import { User, UserDocument } from "../../shared/schemas/user.schema";


@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoomDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Create a new chat room
  async createChatRoom(customerId: string, expertId: string): Promise<ChatRoomDocument> {
    // Generate a normal ObjectId for roomId
    const roomId = new Types.ObjectId();
    
    // Check if room already exists between these users
    const existingRoom = await this.chatRoomModel.findOne({ 
      customerId: new Types.ObjectId(customerId),
      expertId: new Types.ObjectId(expertId)
    }).exec();
    if (existingRoom) {
      return existingRoom;
    }

    const chatRoom = new this.chatRoomModel({
      roomId,
      customerId: new Types.ObjectId(customerId),
      expertId: new Types.ObjectId(expertId),
      status: 'active',
      lastMessageAt: new Date(),
      lastMessage: 'Hello! How can I help you today?',
      unreadCount: 0,
    });

    const savedRoom = await chatRoom.save();

    // Add a welcome message from the expert
    const welcomeMessage = new this.messageModel({
      roomId: savedRoom.roomId,
      senderId: new Types.ObjectId(expertId),
      receiverId: new Types.ObjectId(customerId),
      senderType: 'NutrientExpert',
      content: 'Hello! How can I help you today?',
      messageType: 'text',
      timestamp: new Date(),
      isRead: false,
    });

    await welcomeMessage.save();

    return savedRoom;
  }

  // Get chat rooms for a user
  async getChatRooms(userId: string, userType: 'Customer' | 'NutrientExpert'): Promise<ChatRoomDocument[]> {
    const query = userType === 'Customer' 
      ? { customerId: new Types.ObjectId(userId) }
      : { expertId: new Types.ObjectId(userId) };

    const rooms = await this.chatRoomModel
      .find(query)
      .populate('customerId', 'fullname email')
      .populate('expertId', 'fullname email')
      .populate('lastMessageSender', 'fullname')
      .sort({ lastMessageAt: -1 })
      .exec();

    return rooms;
  }

  // Get messages for a chat room
  async getMessages(roomId: string, page: number = 1, limit: number = 50): Promise<MessageDocument[]> {
    const skip = (page - 1) * limit;
    
    // Convert string roomId to ObjectId for proper querying
    const query = { roomId: new Types.ObjectId(roomId) };
    
    const messages = await this.messageModel
      .find(query)
      .populate('senderId', 'fullname email')
      .populate('receiverId', 'fullname email')
      .sort({ timestamp: 1 }) // Sort by oldest first for proper chat display
      .skip(skip)
      .limit(limit)
      .exec();
    
    return messages;
  }

  // Save a message
  async saveMessage(messageData: {
    roomId: string;
    senderId: string;
    receiverId: string;
    senderType: 'Customer' | 'NutrientExpert';
    content: string;
    messageType?: string;
  }): Promise<MessageDocument> {
    try {
      const message = new this.messageModel({
        ...messageData,
        roomId: new Types.ObjectId(messageData.roomId),
        senderId: new Types.ObjectId(messageData.senderId),
        receiverId: new Types.ObjectId(messageData.receiverId),
        timestamp: new Date(),
      });

      const savedMessage = await message.save();

      // Update chat room with last message info
      const updateResult = await this.chatRoomModel.findOneAndUpdate(
        { roomId: messageData.roomId },
        {
          lastMessage: messageData.content,
          lastMessageAt: savedMessage.timestamp,
          lastMessageSender: new Types.ObjectId(messageData.senderId),
          $inc: { unreadCount: 1 }
        }
      ).exec();

      const populatedMessage = await savedMessage.populate('senderId', 'fullname email');
      
      return populatedMessage;
    } catch (error) {
      console.error('❌ Error in saveMessage:', error);
      throw error;
    }
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

  // Get available experts for a specific customer
  async getAvailableExperts(customerId: string): Promise<any[]> {
    try {
      console.log('🔍 Getting available experts for customerId:', customerId);
      
      // Query experts who have this customer in their clients array
      const experts = await this.userModel
        .find({
          clients: new Types.ObjectId(customerId),
          status: 'Active'
        })
        .populate('roleId', 'name')
        .select('_id fullname email roleId status avatar')
        .exec();

      console.log('🔍 Found experts:', experts.length);

      // Transform the data to match frontend expectations
      return experts.map(expert => ({
        _id: expert._id,
        fullname: expert.fullname,
        email: expert.email,
        roleId: expert.roleId,
        status: expert.status,
        isOnline: true // You can implement real online status logic here
      }));
    } catch (error) {
      console.error('Error fetching available experts:', error);
      return [];
    }
  }

  // Get available customers for a specific expert
  async getAvailableCustomers(expertId: string): Promise<any[]> {
    try {
      // First get the expert to find their clients
      const expert = await this.userModel
        .findById(expertId)
        .populate('clients', '_id fullname email roleId status avatar')
        .exec();

      if (!expert || !expert.clients) {
        return [];
      }

      // Transform the data to match frontend expectations
      return expert.clients.map((customer: any) => ({
        _id: customer._id,
        fullname: customer.fullname,
        email: customer.email,
        roleId: customer.roleId,
        status: customer.status,
        isOnline: true // You can implement real online status logic here
      }));
    } catch (error) {
      console.error('Error fetching available customers:', error);
      return [];
    }
  }

  // Get expert availability status
  async getExpertStatus(expertId: string): Promise<{ isOnline: boolean; lastSeen: Date }> {
    // This would check if expert is currently online
    // For now, return mock data
    return {
      isOnline: true,
      lastSeen: new Date()
    };
  }

  // Get chat room statistics
  async getChatRoomStats(roomId: string): Promise<{
    totalMessages: number;
    unreadMessages: number;
    lastActivity: Date;
    participants: any[];
  } | null> {
    const room = await this.getChatRoomById(roomId);
    
    if (!room) {
      return null;
    }
    
    const messageCount = await this.messageModel.countDocuments({ roomId }).exec();
    const unreadCount = await this.messageModel.countDocuments({ 
      roomId, 
      isRead: false 
    }).exec();
    
    const lastMessage = await this.messageModel
      .findOne({ roomId })
      .sort({ timestamp: -1 })
      .exec();

    return {
      totalMessages: messageCount,
      unreadMessages: unreadCount,
      lastActivity: lastMessage?.timestamp || room.lastMessageAt,
      participants: [room.customerId, room.expertId]
    };
  }

  // Search messages in a room
  async searchMessages(roomId: string, query: string, page: number = 1, limit: number = 20): Promise<MessageDocument[]> {
    const skip = (page - 1) * limit;
    
    return this.messageModel
      .find({
        roomId,
        content: { $regex: query, $options: 'i' },
        isDeleted: false
      })
      .populate('senderId', 'fullname email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  // Get chat room history for admin
  async getChatRoomHistory(limit: number = 50): Promise<ChatRoomDocument[]> {
    return this.chatRoomModel
      .find()
      .populate('customerId', 'fullname email')
      .populate('expertId', 'fullname email')
      .populate('lastMessageSender', 'fullname')
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .exec();
  }

  // Archive chat room
  async archiveChatRoom(roomId: string): Promise<void> {
    await this.chatRoomModel.findOneAndUpdate(
      { roomId },
      { status: 'closed' }
    ).exec();
  }

  // Get active chat rooms count
  async getActiveChatRoomsCount(): Promise<number> {
    return this.chatRoomModel.countDocuments({ status: 'active' }).exec();
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
  async getChatRoomById(roomId: string): Promise<ChatRoomDocument | null> {
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
