import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class PaymentTransaction {
  @Prop({ type: String, required: true, maxlength: 100 })
  gateway: string;

  @Prop({ type: Date, default: Date.now })
  transactionDate: Date;

  @Prop({ type: String, maxlength: 100 })
  accountNumber?: string;

  @Prop({ type: String, maxlength: 250 })
  subAccount?: string;

  @Prop({ type: Number, default: 0 })
  amountIn: number;

  @Prop({ type: Number, default: 0 })
  amountOut: number;

  @Prop({ type: Number, default: 0 })
  accumulated: number;

  @Prop({ type: String, maxlength: 250 })
  code?: string;

  @Prop({ type: String })
  transactionContent?: string;

  @Prop({ type: String, maxlength: 255 })
  referenceNumber?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export type PaymentTransactionDocument = HydratedDocument<PaymentTransaction>;

export const PaymentTransactionSchema =
  SchemaFactory.createForClass(PaymentTransaction);
