import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'subscriptiontypes' })
export class SubscriptionType {
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  name: string;

  @Prop({ type: String, required: false })
  description: string;
}

export const SubscriptionTypeSchema =
  SchemaFactory.createForClass(SubscriptionType);

export type SubscriptionTypeDocument = HydratedDocument<SubscriptionType>;
