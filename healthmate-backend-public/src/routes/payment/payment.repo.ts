import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Order, OrderDocument } from 'src/shared/schemas/order.schema';
import {
  NotFoundOrderException,
  NotFoundSubscriptionException,
  PaymentTransactionAlreadyExistsException,
  NotFoundPaymentException,
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
import { QueryBuilder } from 'src/shared/utils/query-builder';
import { QueryType } from 'src/shared/schemas/request/request.schema';

@Injectable()
export class PaymentRepo {
  private queryBuilder: QueryBuilder<PaymentTransactionDocument>;
  constructor(
    @InjectModel(PaymentTransaction.name)
    private paymentTransactionModel: Model<PaymentTransactionDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.queryBuilder = new QueryBuilder<PaymentTransactionDocument>(
      this.paymentTransactionModel,
    );
  }

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

    // const paymentId = body.code
    //   ? Number(body.code.split(PREFIX_PAYMENT_CODE)[1])
    //   : Number(body.content?.split(PREFIX_PAYMENT_CODE)[1]);
    const orderId = body.code
      ? body.code.split(PREFIX_PAYMENT_CODE)[1]
      : body.content?.split(PREFIX_PAYMENT_CODE)[1];

    if (!orderId) {
      throw new BadRequestException('Cannot get payment id from content');
    }

    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid payment ID format');
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) throw NotFoundOrderException;

    const price = await this.getPrice(order._id);
    if (Number(price) !== Number(body.transferAmount)) {
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

      const subscription = await this.subscriptionModel.findById(
        order.subscription,
      );
      if (!subscription) throw NotFoundSubscriptionException;

      const now = new Date();
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + subscription.durationDays);

      await this.orderModel.updateOne(
        { _id: order._id },
        {
          status: PaymentStatus.SUCCESS,
          startDate,
          endDate,
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
  async findAll(query: QueryType) {
    const parsedQuery: any = { ...query };
    
    if (
      typeof query.dateFrom === 'string' &&
      typeof query.dateTo === 'string'
    ) {
      const from = new Date(query.dateFrom);
      const to = new Date(query.dateTo);
      parsedQuery.transactionDate = { $gte: from, $lte: to };

      delete parsedQuery.dateFrom;
      delete parsedQuery.dateTo;
    }

    return this.queryBuilder.query({
      query: parsedQuery,
      allowedFilters: [
        'gateway',
        'accountNumber',
        'subAccount',
        'transactionDate',
        'amountIn',
        'amountOut',
        'accumulated',
        'code',
        'referenceNumber',
        'transactionContent',
      ],
    });
  }

  async findById(id: string) {
    const payment = await this.paymentTransactionModel.findById(id).lean();

    if (!payment) {
      throw NotFoundPaymentException;
    }

    return payment;
  }
}
