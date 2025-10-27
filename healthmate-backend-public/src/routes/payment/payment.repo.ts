import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Order, OrderDocument } from 'src/shared/schemas/order.schema';
import { Payment, PaymentDocument } from 'src/shared/schemas/payment.schema';
import {
  NotFoundOrderException,
  NotFoundSubscriptionException,
  PaymentTransactionAlreadyExistsException,
} from './payment.error';
import {
  Subscription,
  SubscriptionDocument,
} from 'src/shared/schemas/subscription.schema';
import { WebhookPaymentBodyType } from './schema/request/payment.request.schema';
import {
  PaymentTransaction,
  PaymentTransactionDocument,
} from 'src/shared/schemas/paymentTransaction.schema';
import { parse } from 'date-fns';
import {
  PaymentStatus,
  PREFIX_PAYMENT_CODE,
} from 'src/shared/constants/payment.constant';
import { User, UserDocument } from 'src/shared/schemas/user.schema';

@Injectable()
export class PaymentRepo {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(PaymentTransaction.name)
    private paymentTransactionModel: Model<PaymentTransactionDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private async getPrice(orderId: Types.ObjectId) {
    const order = await this.orderModel
      .findOne({ _id: orderId })
      .populate('subscription');
    if (!order) throw NotFoundOrderException;

    const subscription = await this.subscriptionModel.findOne({
      _id: order.subscription,
    });
    if (!subscription) throw NotFoundSubscriptionException;

    return subscription.price;
  }

  async receiver(body: WebhookPaymentBodyType) {
    let amountIn = 0;
    let amountOut = 0;
    if (body.transferType === 'in') {
      amountIn = body.transferAmount;
    } else if (body.transferType === 'out') {
      amountOut = body.transferAmount;
    }

    const existingTx = await this.paymentTransactionModel.findOne({
      id: body.id,
    });
    if (existingTx) throw PaymentTransactionAlreadyExistsException;

    const paymentId = body.code
      ? Number(body.code.split(PREFIX_PAYMENT_CODE)[1])
      : Number(body.content?.split(PREFIX_PAYMENT_CODE)[1]);
    if (isNaN(paymentId)) {
      throw new BadRequestException('Cannot get payment id from content');
    }

    const payment = await this.paymentModel.findOne({ _id: paymentId });
    if (!payment) {
      throw new BadRequestException(`Cannot find payment with id ${paymentId}`);
    }

    const order = await this.orderModel.findOne({ _id: payment.order });
    if (!order) throw NotFoundOrderException;

    const price = await this.getPrice(order._id);
    if (price !== body.transferAmount) {
      throw new BadRequestException(
        `Price not match, expected ${price} but got ${body.transferAmount}`,
      );
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.paymentTransactionModel.create(
        [
          {
            id: body.id,
            gateway: body.gateway,
            transactionDate: parse(
              body.transactionDate,
              'yyyy-MM-dd HH:mm:ss',
              new Date(),
            ),
            accountNumber: body.accountNumber,
            subAccount: body.subAccount,
            amountIn,
            amountOut,
            accumulated: body.accumulated,
            code: body.code,
            transactionContent: body.content,
            referenceNumber: body.referenceCode,
            description: body.description,
          },
        ],
        { session },
      );

      await this.paymentModel.updateOne(
        { _id: paymentId },
        { status: PaymentStatus.SUCCESS },
        { session },
      );

      const subscription = await this.subscriptionModel.findOne({
        _id: order.subscription,
      });
      if (!subscription) throw NotFoundSubscriptionException;

      await this.orderModel.updateOne(
        { _id: order._id },
        {
          status: PaymentStatus.SUCCESS,
          startDate: new Date(Date.now()).getDate(),
          endDate: new Date(Date.now()).setDate(
            new Date(Date.now()).getDate() + subscription.durationDays,
          ),
        },
        { session },
      );

      await this.userModel.updateOne(
        { _id: order.user },
        { subscription: order.subscription },
      );
      await session.commitTransaction();

      return { message: 'Payment success!' };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}
