import { Injectable } from '@nestjs/common';
import { PaymentStatus } from 'src/shared/constants/payment.constant';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderStatus } from '../constants/order.constant';

@Injectable()
export class SharedPaymentRepository {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async cancelPaymentAndOrder(paymentId: number) {
    const payment = await this.paymentModel
      .findById(paymentId)
      .populate('order');
    if (!payment) {
      throw new Error('Payment not found');
    }

    const order = await this.orderModel.findById(payment.order._id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Order is not pending');
    }

    const $updateOrder = this.orderModel.updateOne(
      { _id: order._id },
      { status: OrderStatus.CANCELLED },
    );
    const $updatePayment = this.paymentModel.updateOne(
      { _id: paymentId },
      { status: PaymentStatus.FAILED },
    );

    await Promise.all([$updateOrder, $updatePayment]);
  }
}
