import { Injectable } from '@nestjs/common';
import { QueryBuilder } from 'src/shared/utils/query-builder';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { Order, OrderDocument } from '../../shared/schemas/order.schema';
import { CreateOrderBodyType } from './schema/request/order.request.schema';
import { OrderStatus } from 'src/shared/constants/order.constant';
import {
  CannotCancelOrderException,
  NotFoundOrderException,
} from './order.error';

@Injectable()
export class OrderRepo {
  private queryBuilder: QueryBuilder<OrderDocument>;

  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
  ) {
    this.queryBuilder = new QueryBuilder<OrderDocument>(this.orderModel);
  }

  async findAll(query: QueryType) {
    const queryOrders = await this.queryBuilder.query({
      query,
      allowedFilters: ['name', 'module'],
      populateFields: [
        {
          path: 'user',
          select: '_id email fullname phoneNumber gender avatar',
        },
      ],
    });

    return queryOrders;
  }

  async detail(userId: Types.ObjectId, orderId: Types.ObjectId) {
    const order = await this.orderModel
      .findOne({ _id: orderId, user: userId })
      .populate({
        path: 'user',
        select: '_id email fullname phoneNumber gender avatar',
      })
      .populate({
        path: 'subscription',
      });

    if (!order) {
      throw NotFoundOrderException;
    }

    return order;
  }

  create(userId: Types.ObjectId, data: CreateOrderBodyType) {
    return this.orderModel.create({
      user: userId,
      subscription: new Types.ObjectId(data.subscriptionId),
      status: OrderStatus.PENDING,
    });
  }

  async cancel(userId: Types.ObjectId, orderId: Types.ObjectId) {
    const order = await this.orderModel.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw NotFoundOrderException;
    }
    if (order.status !== OrderStatus.PENDING) {
      throw CannotCancelOrderException;
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    return {
      message: 'Cancel order successfully',
    };
  }
}
