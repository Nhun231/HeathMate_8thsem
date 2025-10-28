import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Subscription } from 'src/shared/schemas/subscription.schema';
import { OrderStatus } from 'src/shared/constants/order.constant';
import { User } from 'src/shared/schemas/user.schema';

@Schema({ timestamps: true })
export class Order {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Subscription.name,
    required: true,
  })
  subscription: Types.ObjectId;

  @Prop({
    type: String,
    enum: [
      OrderStatus.PENDING,
      OrderStatus.ACTIVE,
      OrderStatus.EXPIRES,
      OrderStatus.CANCELLED,
      OrderStatus.FAILED,
    ],
    default: OrderStatus.PENDING,
  })
  status: string;

  @Prop({
    type: Date,
    required: false,
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: false,
  })
  endDate: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export type OrderDocument = HydratedDocument<Order>;
