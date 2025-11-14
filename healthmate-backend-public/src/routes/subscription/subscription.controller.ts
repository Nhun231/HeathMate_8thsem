import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { QuerySchema } from 'src/shared/schemas/request/request.schema';
import {
  CreateSubscriptionBodyDTO,
  GetSubscriptionParamsDTO,
  UpdateSubscriptionBodyDTO,
} from './subscription.dto';

@Controller('v1/subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  async listSubscriptions(@Query() query: Record<string, string>) {
    const parsed = QuerySchema.parse(query);
    return this.subscriptionService.findAll(parsed);
  }

  @Get(':subId')
  async getSubscription(@Param() params: GetSubscriptionParamsDTO) {
    return this.subscriptionService.findOne(params.subId);
  }

  @Post()
  async createSubscription(@Body() body: CreateSubscriptionBodyDTO) {
    return this.subscriptionService.create(body);
  }

  @Put(':subId')
  async updateSubscription(
    @Param() params: GetSubscriptionParamsDTO,
    @Body() body: UpdateSubscriptionBodyDTO,
  ) {
    return this.subscriptionService.update(params.subId, body);
  }
}
