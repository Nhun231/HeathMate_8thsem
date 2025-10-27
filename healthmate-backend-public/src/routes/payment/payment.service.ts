import { Injectable } from '@nestjs/common';
import { PaymentRepo } from 'src/routes/payment/payment.repo';
import {
  GenerateQRCodeType,
  WebhookPaymentBodyType,
} from './schema/request/payment.request.schema';
import envConfig from 'src/shared/utils/config';
import { PREFIX_PAYMENT_CODE } from 'src/shared/constants/payment.constant';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepo) {}

  async receiver(body: WebhookPaymentBodyType) {
    const { message } = await this.paymentRepo.receiver(body);

    return {
      message,
    };
  }

  generateQrCode(body: GenerateQRCodeType) {
    const qrCode = `https://qr.sepay.vn/img?acc=${envConfig.SEPAY_BANK_ACCOUNT}&bank=${envConfig.SEPAY_BANK}&amount=${body.amount}&des=${PREFIX_PAYMENT_CODE}${body.orderId}`;
    return { url: qrCode };
  }
}
