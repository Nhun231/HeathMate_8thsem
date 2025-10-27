import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './subscription.repo';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Subscription,
  SubscriptionSchema,
} from '../../shared/schemas/subscription.schema';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository],
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
})
export class SubscriptionModule {}
