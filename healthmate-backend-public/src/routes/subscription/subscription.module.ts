import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './subscription.repo';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Subscription,
  SubscriptionSchema,
} from '../../shared/schemas/subscription.schema';
import {
  SubscriptionType,
  SubscriptionTypeSchema,
} from 'src/shared/schemas/subscriptionType.schema';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository],
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    MongooseModule.forFeature([
      { name: SubscriptionType.name, schema: SubscriptionTypeSchema },
    ]),
  ],
})
export class SubscriptionModule {}
