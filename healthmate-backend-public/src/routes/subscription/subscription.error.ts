import { UnprocessableEntityException } from '@nestjs/common';

export const NotFoundSubscriptionException = new UnprocessableEntityException({
  message: 'Error.NotFoundSubscription',
  path: 'subscription',
});
