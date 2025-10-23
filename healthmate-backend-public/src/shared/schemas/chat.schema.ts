import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatRoomDocument = ChatRoom & Document;
export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({ required: true, unique: true, type: Types.ObjectId })
  roomId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  customerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  expertId: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: ['active', 'closed', 'waiting'],
    default: 'active'
  })
  status: string;

  @Prop({ type: Date, default: Date.now })
  lastMessageAt: Date;

  @Prop({ type: String, default: '' })
  lastMessage: string;

  @Prop({ type: Number, default: 0 })
  unreadCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastMessageSender: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: Types.ObjectId })
  roomId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  receiverId: Types.ObjectId;

  @Prop({ required: true, enum: ['Customer', 'NutrientExpert'] })
  senderType: string;

  @Prop({ required: true })
  content: string;

  @Prop({ 
    required: true, 
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  })
  messageType: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Date })
  readAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for better performance
ChatRoomSchema.index({ roomId: 1 });
ChatRoomSchema.index({ customerId: 1 });
ChatRoomSchema.index({ expertId: 1 });
ChatRoomSchema.index({ status: 1 });
ChatRoomSchema.index({ lastMessageAt: -1 });

MessageSchema.index({ roomId: 1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1 });
MessageSchema.index({ timestamp: -1 });
MessageSchema.index({ isRead: 1 });
