import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, Types } from 'mongoose';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { QueryBuilder } from 'src/shared/utils/query-builder';
import {
  Subscription,
  SubscriptionDocument,
} from '../../shared/schemas/subscription.schema';

@Injectable()
export class SubscriptionRepository {
  private queryBuilder: QueryBuilder<SubscriptionDocument>;

  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {
    this.queryBuilder = new QueryBuilder<SubscriptionDocument>(
      this.subscriptionModel,
    );
  }

  async findAll(query: QueryType) {
    const querySubscriptions = await this.queryBuilder.query({
      query,
      allowedFilters: ['name', 'type', 'duration', 'price'],
    });

    return querySubscriptions;
  }

  async findOne(id: Types.ObjectId) {
    return this.subscriptionModel.findById(id);
  }

  async create(data: Partial<Subscription>) {
    return this.subscriptionModel.create(data);
  }

  async update(id: Types.ObjectId, data: Partial<Subscription>) {
    return this.subscriptionModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.subscriptionModel.deleteOne({ _id: id });
  }
}
