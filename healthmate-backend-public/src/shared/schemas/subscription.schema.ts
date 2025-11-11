import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { SubscriptionType } from './subscriptionType.schema';

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: SubscriptionType.name,
    required: true,
  })
  type: Types.ObjectId;

  @Prop({ type: Number, required: true })
  durationDays: number;

  @Prop({ type: Number, required: true })
  price: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

export type SubscriptionDocument = HydratedDocument<Subscription>;
