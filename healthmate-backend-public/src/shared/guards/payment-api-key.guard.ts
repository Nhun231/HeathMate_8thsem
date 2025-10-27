import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import envConfig from '../utils/config';

@Injectable()
export class PaymentAPIKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // const paymentApiKey = request.headers['Authorization']?.split(' ')[1];
    const paymentApiKey = request.headers['payment-api-key'];
    if (paymentApiKey !== envConfig.PAYMENT_API_KEY) {
      // throw new UnauthorizedException('Invalid API Key');
      return false;
    }
    return true;
  }
}
