import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayload,
  AccessTokenPayloadCreate,
  RefreshTokenPayload,
  RefreshTokenPayloadCreate,
} from '../types/jwt.type';
import envConfig from '../config';

@Injectable()
export class TokenService {
  private uuid: () => string;

  constructor(private readonly jwtService: JwtService) {
    void import('uuid').then((module) => {
      this.uuid = module.v4;
    });
  }

  signAccessToken(payload: AccessTokenPayloadCreate): string {
    return this.jwtService.sign(
      { ...payload, uuid: this.uuid() },
      {
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    );
  }

  signRefreshToken(payload: RefreshTokenPayloadCreate) {
    return this.jwtService.sign(
      { ...payload, uuid: this.uuid() },
      {
        secret: envConfig.REFRESH_TOKEN_SECRET,
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
        algorithm: 'HS256',
      },
    );
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      algorithms: ['HS256'],
    });
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      algorithms: ['HS256'],
    });
  }
}
