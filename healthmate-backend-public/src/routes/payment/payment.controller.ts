import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MessageResponseDTO } from 'src/shared/dtos/response.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { Auth, IsPublic } from 'src/shared/decorators/auth.decorator';
import {
  GenerateQRCodeDTO,
  WebhookPaymentBodyDTO,
} from 'src/routes/payment/payment.dto';
import { AuthType } from 'src/shared/constants/auth.constant';

@Controller('v1/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/receiver')
  @ZodSerializerDto(MessageResponseDTO)
  @Auth([AuthType.PaymentAPIKey])
  receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body);
  }

  @Post('/generate-qr-code')
  @IsPublic()
  generateQrCode(@Body() body: GenerateQRCodeDTO) {
    return this.paymentService.generateQrCode(body);
  }
}
