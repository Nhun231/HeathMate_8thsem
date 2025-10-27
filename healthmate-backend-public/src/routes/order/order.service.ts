import { Injectable } from '@nestjs/common';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { Types } from 'mongoose';
import { OrderRepo } from './order.repo';
import { CreateOrderBodyType } from './schema/request/order.request.schema';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepo) {}

  async list(query: QueryType) {
    return this.orderRepository.findAll(query);
  }

  async detail(userId: string, orderId: string) {
    const order = await this.orderRepository.detail(
      new Types.ObjectId(userId),
      new Types.ObjectId(orderId),
    );

    return order;
  }

  async create(userId: string, order: CreateOrderBodyType) {
    return this.orderRepository.create(new Types.ObjectId(userId), order);
  }

  async cancel(userId: string, orderId: string) {
    return this.orderRepository.cancel(
      new Types.ObjectId(userId),
      new Types.ObjectId(orderId),
    );
  }
}
