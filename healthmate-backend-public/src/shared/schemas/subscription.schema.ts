import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SubscriptionType } from 'src/shared/constants/subscription.constant';

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: String, required: true })
  name: number;

  @Prop({
    type: String,
    enum: [SubscriptionType.INDEPTH, SubscriptionType.ADVANCED],
    required: true,
  })
  type: string;

  @Prop({ type: Number, required: true })
  durationDays: number;

  @Prop({ type: Number, required: true })
  price: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

export type SubscriptionDocument = HydratedDocument<Subscription>;
