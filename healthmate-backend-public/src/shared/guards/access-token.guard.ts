import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { REQUEST_USER_KEY } from '../constants/auth.constant';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      console.log('Access token is missing');
      // throw new UnauthorizedException('Access token is missing');
      return false;
    }
    try {
      const decodedToken =
        await this.tokenService.verifyAccessToken(accessToken);
      request[REQUEST_USER_KEY] = decodedToken;
      return true;
    } catch (error) {
      console.log(error);
      // throw new UnauthorizedException('Invalid access token');
      return false;
    }
  }
}
