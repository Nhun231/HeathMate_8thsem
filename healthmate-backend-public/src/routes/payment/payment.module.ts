import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';
import { BullModule } from '@nestjs/bullmq';
import { PaymentRepo } from './payment.repo';
import { PaymentProducer } from './payment.producer';
import { PaymentSchema, Payment } from 'src/shared/schemas/payment.schema';
import {
  PaymentTransaction,
  PaymentTransactionSchema,
} from 'src/shared/schemas/paymentTransaction.schema';
import {
  Subscription,
  SubscriptionSchema,
} from 'src/shared/schemas/subscription.schema';
import { Order, OrderSchema } from 'src/shared/schemas/order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/shared/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    MongooseModule.forFeature([
      { name: PaymentTransaction.name, schema: PaymentTransactionSchema },
    ]),
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepo, PaymentProducer],
})
export class PaymentModule { }