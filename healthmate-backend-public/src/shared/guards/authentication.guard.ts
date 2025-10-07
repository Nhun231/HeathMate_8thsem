import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
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
    const authTypeValues = this.getAuthTypeValue(context);

    const guards = authTypeValues.authTypes.map((authType) => {
      return this.authTypeGuardMap[authType];
    });

    return authTypeValues.options.condition === ConditionGuard.AND
      ? this.handleAndCondition(guards, context)
      : this.handleOrCondition(guards, context);
  }

  private getAuthTypeValue(
    context: ExecutionContext,
  ): AuthTypeDecoratorPayload {
    const authTypeValues = this.reflector.getAllAndOverride<
      AuthTypeDecoratorPayload | undefined
    >(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()]) ?? {
      authTypes: [AuthType.Bearer],
      options: { condition: ConditionGuard.AND },
    };
    return authTypeValues;
  }

  private async handleOrCondition(
    guards: CanActivate[],
    context: ExecutionContext,
  ) {
    let lastError: any = null;

    for (const guard of guards) {
      try {
        if (await guard.canActivate(context)) {
          return true;
        }
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError instanceof HttpException) {
      throw lastError;
    }
    throw new UnauthorizedException();
  }

  private async handleAndCondition(
    guards: CanActivate[],
    context: ExecutionContext,
  ) {
    for (const guard of guards) {
      try {
        if (!(await guard.canActivate(context))) {
          throw new UnauthorizedException();
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new UnauthorizedException();
      }
    }
    return true;
  }
}
