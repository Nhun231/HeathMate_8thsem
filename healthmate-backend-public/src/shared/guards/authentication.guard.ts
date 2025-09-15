import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTH_TYPE_KEY,
  AuthTypeDecoratorPayload,
} from '../decorators/auth.decorator';
import { AccessTokenGuard } from './access-token.guard';
import { AuthType, ConditionGuard } from '../constants/auth.constant';
import { APIKeyGuard } from './api-key.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.APIKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValues = this.reflector.getAllAndOverride<
      AuthTypeDecoratorPayload | undefined
    >(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()]) ?? {
      authTypes: [AuthType.Bearer],
      options: { condition: ConditionGuard.AND },
    };

    const guards = authTypeValues.authTypes.map((authType) => {
      return this.authTypeGuardMap[authType];
    });
    let error = new UnauthorizedException();

    if (authTypeValues.options.condition == ConditionGuard.OR) {
      for (const guard of guards) {
        const canActivate = await Promise.resolve(
          guard.canActivate(context),
        ).catch((err) => {
          error = err;
          return false;
        });
        if (canActivate) {
          return true;
        }
      }
      throw error;
    } else {
      for (const guard of guards) {
        const canActivate = await Promise.resolve(
          guard.canActivate(context),
        ).catch((err) => {
          error = err;
          return false;
        });
        if (!canActivate) {
          throw error;
        }
      }
      return true;
    }
  }
}
