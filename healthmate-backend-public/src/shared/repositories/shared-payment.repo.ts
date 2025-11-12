import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus } from '../constants/order.constant';

@Injectable()
export class SharedPaymentRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async cancelPaymentAndOrder(orderId: number) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Order is not pending');
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();
  }
}
