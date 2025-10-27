import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepo } from './order.repo';
import { Order, OrderSchema } from '../../shared/schemas/order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';
import { OrderProducer } from './order.producer';

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepo, OrderProducer],
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),

    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
})
export class OrderModule {}
