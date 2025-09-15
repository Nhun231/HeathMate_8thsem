import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '../types/jwt.type';
import { REQUEST_USER_KEY } from '../constants/auth.constant';

export const ActiveUser = createParamDecorator(
  (field: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AccessTokenPayload | undefined = request[REQUEST_USER_KEY];
    // console.log(user);
    // console.log(field);

    return field ? user?.[field] : user;
  },
);
