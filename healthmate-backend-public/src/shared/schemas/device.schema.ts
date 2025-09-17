import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Device {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: Types.ObjectId | UserDocument;

  @Prop({ type: String, required: true })
  userAgent: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: Date })
  lastActive: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

export type DeviceDocument = HydratedDocument<Device>;
