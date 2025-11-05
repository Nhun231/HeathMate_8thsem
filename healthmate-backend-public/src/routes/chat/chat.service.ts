import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom, ChatRoomDocument, Message, MessageDocument } from '../../shared/schemas/chat.schema';
import { User, UserDocument } from '../../shared/schemas/user.schema';
import {
  NotFoundChatRoomException,
  NotFoundMessageException,
  NotFoundUserException,
  UnauthorizedChatAccessException,
  InvalidMessageContentException,
  ChatRoomCreationFailedException,
  MessageSendFailedException,
} from './chat.error';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoomDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Create a new chat room
  async createChatRoom(customerId: string, expertId: string): Promise<ChatRoomDocument> {
    const customerObjectId = new Types.ObjectId(customerId);
    const expertObjectId = new Types.ObjectId(expertId);
    // Check if room already exists between these users
    const existingRoom = await this.chatRoomModel.findOne({
      $or: [
        { customerId: customerObjectId, expertId: expertObjectId },
        { customerId: expertObjectId, expertId: customerObjectId },
      ],
    }).exec();
    if (existingRoom) {
      return existingRoom;
    }
    // Use create() for new room and handle duplicates
    try {
      const chatRoom = await this.chatRoomModel.create({
        customerId: customerObjectId,
        expertId: expertObjectId,
        status: 'Active',
        lastMessageAt: new Date(),
        lastMessage: 'Chat started',
        unreadCount: 0,
      });
      // Add customerId to expert's clients list if not present
      await this.userModel.updateOne(
        { _id: expertObjectId },
        { $addToSet: { clients: customerObjectId } }
      ).exec();
      return chatRoom;
    } catch (error) {
      if ((error as any)?.code === 11000) {
        // Duplicate key: fetch and return existing room
        const dupRoom = await this.chatRoomModel.findOne({
          $or: [
            { customerId: customerObjectId, expertId: expertObjectId },
            { customerId: expertObjectId, expertId: customerObjectId },
          ],
        }).exec();
        if (dupRoom) return dupRoom;
      }
      throw error;
    }
  }

  // Get chat rooms for a user
  async getChatRooms(userId: Types.ObjectId, userType: 'Customer' | 'NutritionExpert'): Promise<any[]> {
    try {
      // Ensure userId is properly converted to ObjectId for MongoDB query
      const userObjectId = new Types.ObjectId(userId);
      const query = userType === 'Customer' 
        ? { customerId: userObjectId }
        : { expertId: userObjectId };
      const rooms = await this.chatRoomModel
        .find(query)
        .populate('customerId', 'fullname email')
        .populate('expertId', 'fullname email')
        .sort({ lastMessageAt: -1 })
        .exec();

      // Transform the response to include roomId field
      return rooms.map(room => {
        const roomObj = room.toObject();
        return {
          ...roomObj,
          roomId: (room._id as Types.ObjectId).toString(),
          customerId: room.customerId,
          expertId: room.expertId,
        };
      });
    } catch (error) {
      throw new Error('Failed to load chat rooms');
    }
  }

  // Get messages for a chat room
  async getMessages(roomId: string, page: number = 1, limit: number = 1000): Promise<MessageDocument[]> {
    try {
      const skip = (page - 1) * limit;
      const roomObjectId = new Types.ObjectId(roomId);
      
      // First check if chat room exists
      const room = await this.chatRoomModel.findById(roomObjectId).exec();
      if (!room) {
        throw NotFoundChatRoomException;
      }
      
      const messages = await this.messageModel
        .find({ roomId: roomObjectId })
        .populate('senderId', 'fullname email')
        .populate('receiverId', 'fullname email')
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit)
        .exec();
      
      return messages;
    } catch (error) {
      if (error === NotFoundChatRoomException) {
        throw error;
      }
      throw new Error('Failed to load messages');
    }
  }

  // Save a message
  async saveMessage(messageData: {
    roomId: string;
    senderId: string;
    receiverId: string;
    content: string;
    messageType?: string;
  }  ): Promise<MessageDocument> {
    try {
      
      // Validate content
      if (!messageData.content || messageData.content.trim().length === 0) {
        throw InvalidMessageContentException;
      }

      const roomObjectId = new Types.ObjectId(messageData.roomId);
      const senderObjectId = new Types.ObjectId(messageData.senderId);
      const receiverObjectId = new Types.ObjectId(messageData.receiverId);
      

      // Check if chat room exists
      const room = await this.chatRoomModel.findById(roomObjectId).exec();
      if (!room) {
        throw NotFoundChatRoomException;
      }

      // Verify sender is part of the chat room
      
      if (!room.customerId.equals(senderObjectId) && !room.expertId.equals(senderObjectId)) {
        throw UnauthorizedChatAccessException;
      }

      const message = new this.messageModel({
        ...messageData,
        roomId: roomObjectId,
        senderId: senderObjectId,
        receiverId: receiverObjectId,
        timestamp: new Date(),
      });

      const savedMessage = await message.save();

      // Update chat room with last message info
      await this.chatRoomModel.findOneAndUpdate(
        { _id: roomObjectId },
        {
          lastMessage: messageData.content,
          lastMessageAt: savedMessage.timestamp,
          $inc: { unreadCount: 1 }
        }
      ).exec();

      const populatedMessage = await savedMessage.populate('senderId', 'fullname email');
      
      return populatedMessage;
    } catch (error) {
      if (error === InvalidMessageContentException || 
          error === NotFoundChatRoomException || 
          error === UnauthorizedChatAccessException) {
        throw error;
      }
      throw new Error('Failed to save message: ' + error.message);
    }
  }

  // Mark messages as read
  async markAsRead(roomId: string, userId: string): Promise<void> {
    const roomObjectId = new Types.ObjectId(roomId);
    const userObjectId = new Types.ObjectId(userId);
    
    await this.messageModel.updateMany(
      { 
        roomId: roomObjectId, 
        receiverId: userObjectId,
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    ).exec();

    // Reset unread count for the room
    await this.chatRoomModel.findOneAndUpdate(
      { _id: roomObjectId },
      { unreadCount: 0 }
    ).exec();
  }

  // Get available experts for a specific customer
  async getAvailableExperts(customerId: string): Promise<any[]> {
    try {
      
      // Find all users with NutritionExpert role
      const experts = await this.userModel
        .find({
          status: 'Active'
        })
        .populate('roleId', 'name')
        .select('_id fullname email roleId status')
        .exec();

      // Filter users who have NutritionExpert role
      const expertUsers = experts.filter(user => {
        const role = user.roleId as any;
        return role?.name === 'NutritionExpert';
      });


      return expertUsers.map(expert => ({
        _id: expert._id,
        fullname: expert.fullname,
        email: expert.email,
        roleId: expert.roleId,
        status: expert.status,
      }));
    } catch (error) {
      return [];
    }
  }

  // Get available customers for a specific expert (from existing chat rooms)
  async getAvailableCustomers(expertId: string): Promise<any[]> {
    try {
      const expertObjectId = new Types.ObjectId(expertId);
      
      // Find all chat rooms where this expert is involved
      const chatRooms = await this.chatRoomModel
        .find({ expertId: expertObjectId })
        .populate('customerId', '_id fullname email roleId status')
        .select('customerId')
        .exec();


      // Extract unique customers from chat rooms
      const customers = chatRooms
        .map(room => room.customerId)
        .filter((customer, index, self) => 
          customer && // Filter out null customers
          self.findIndex(c => c._id.toString() === customer._id.toString()) === index // Remove duplicates
        );

      
      return customers.map((customer: any) => ({
        _id: customer._id,
        fullname: customer.fullname,
        email: customer.email,
        roleId: customer.roleId,
        status: customer.status,
      }));
    } catch (error) {
      return [];
    }
  }

  // Get chat room by ID
  async getChatRoomById(roomId: string): Promise<any> {
    try {
      const roomObjectId = new Types.ObjectId(roomId);
      
      const room = await this.chatRoomModel
        .findOne({ _id: roomObjectId })
        .populate('customerId', 'fullname email')
        .populate('expertId', 'fullname email')
        .exec();
      
      if (!room) {
        throw NotFoundChatRoomException;
      }
      
      // Transform response to include roomId field
      const roomObj = room.toObject();
      return {
        ...roomObj,
        roomId: (room._id as Types.ObjectId).toString(),
        customerId: room.customerId,
        expertId: room.expertId,
      };
    } catch (error) {
      if (error === NotFoundChatRoomException) {
        throw error;
      }
      throw new Error('Failed to load chat room');
    }
  }
}