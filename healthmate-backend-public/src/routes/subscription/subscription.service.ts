import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repo';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { DeleteResult, Types } from 'mongoose';
import {
  CreateSubscriptionSchemaType,
  UpdateSubscriptionSchemaType,
} from './schema/request/subscription.request.schema';
import { NotFoundSubscriptionException } from './subscription.error';

@Injectable()
export class SubscriptionService {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async findAll(query: QueryType) {
    return this.subscriptionRepo.findAll(query);
  }

  async findOne(id: string) {
    const subscription = await this.subscriptionRepo.findOne(
      new Types.ObjectId(id),
    );
    if (!subscription) throw NotFoundSubscriptionException;
    return subscription;
  }

  async create(data: CreateSubscriptionSchemaType) {
    const subType = new Types.ObjectId(data.type);
    return this.subscriptionRepo.create({ ...data, type: subType });
  }

  async update(id: string, data: UpdateSubscriptionSchemaType) {
    const subscription = await this.findOne(id);

    let subType = subscription.type;

    if (data.type) subType = new Types.ObjectId(data.type);

    return this.subscriptionRepo.update(subscription._id, {
      ...data,
      type: subType,
    });
  }

  async delete(id: string): Promise<DeleteResult> {
    const subscription = await this.findOne(id);

    return this.subscriptionRepo.delete(subscription._id);
  }
}
