import { createZodDto } from 'nestjs-zod';
import {
  CreateOrderBodySchema,
  DeleteOrderSchema,
  GetOrderParamsSchema,
} from './schema/request/order.request.schema';

export class GetOrderParamsDTO extends createZodDto(GetOrderParamsSchema) {}

export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}

export class DeleteOrderDTO extends createZodDto(DeleteOrderSchema) {}
