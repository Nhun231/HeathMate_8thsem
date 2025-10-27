import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import envConfig from '../utils/config';

@Injectable()
export class PaymentAPIKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    console.log("Header: ", request.headers);
    console.log('Body:', request.body);

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [prefix, apiKey] = authHeader.split(' ');

    if (prefix.toLowerCase() !== 'apikey') {
      throw new UnauthorizedException('Invalid Authorization prefix');
    }

    if (apiKey !== envConfig.PAYMENT_API_KEY) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true
  }
}
