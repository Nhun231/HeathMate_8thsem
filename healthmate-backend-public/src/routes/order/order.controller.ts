import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { QuerySchema } from 'src/shared/schemas/request/request.schema';
import { OrderService } from './order.service';
import { CreateOrderBodyDTO, GetOrderParamsDTO } from './order.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('v1/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async list(@Query() query: Record<string, string>) {
    const parsed = QuerySchema.parse(query);
    return this.orderService.list(parsed);
  }

  @Get(':orderId')
  async detail(
    @ActiveUser('userId') userId: string,
    @Param() params: GetOrderParamsDTO,
  ) {
    return this.orderService.detail(userId, params.orderId);
  }

  @Post()
  async create(
    @Body() body: CreateOrderBodyDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.orderService.create(userId, body);
  }

  @Put(':orderId')
  async cancel(
    @ActiveUser('userId') userId: string,
    @Param() params: GetOrderParamsDTO,
  ) {
    return this.orderService.cancel(userId, params.orderId);
  }
}
