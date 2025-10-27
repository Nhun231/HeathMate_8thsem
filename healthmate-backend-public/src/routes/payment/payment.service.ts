import { Injectable } from '@nestjs/common';
import { PaymentRepo } from 'src/routes/payment/payment.repo';
import { WebhookPaymentBodyType } from './schema/request/payment.request.schema';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepo) {}

  async receiver(body: WebhookPaymentBodyType) {
    const { message } = await this.paymentRepo.receiver(body);

    return {
      message,
    };
  }
}
