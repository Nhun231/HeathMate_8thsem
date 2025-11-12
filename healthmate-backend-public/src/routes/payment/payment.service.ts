import { Injectable } from '@nestjs/common';
import { PaymentRepo } from 'src/routes/payment/payment.repo';
import {
  GenerateQRCodeType,
  WebhookPaymentBodyType,
} from './schema/request/payment.request.schema';
import envConfig from 'src/shared/utils/config';
import { PREFIX_PAYMENT_CODE } from 'src/shared/constants/payment.constant';
import {PaginatedResult} from "../../shared/interfaces/paginated-result.interface";
import {PaginateDto} from "../../shared/dtos/paginate.dto";
import { QueryType } from 'src/shared/schemas/request/request.schema';

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
  
  async findAll(query: QueryType): Promise<PaginatedResult<any>> {
    const result = await this.paymentRepo.findAll(query);

    return {
      items: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getDetails(id: string) {
  return this.paymentRepo.findById(id);
}

}
