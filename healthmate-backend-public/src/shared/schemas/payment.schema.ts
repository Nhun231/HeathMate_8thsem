import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Order } from './order.schema';
import { PaymentStatus } from 'src/shared/constants/payment.constant';

@Schema({ timestamps: true })
export class Payment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Order.name,
    required: true,
  })
  order: Types.ObjectId;

  @Prop({
    type: String,
    enum: [PaymentStatus.PENDING, PaymentStatus.SUCCESS, PaymentStatus.FAILED],
    default: PaymentStatus.PENDING,
  })
  status: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

export type PaymentDocument = HydratedDocument<Payment>;
