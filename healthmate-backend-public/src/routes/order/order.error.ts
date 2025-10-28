import { UnprocessableEntityException } from '@nestjs/common';

export const NotFoundOrderException = new UnprocessableEntityException([
  {
    message: 'Error.NotFoundOrder',
    path: 'order',
  },
]);

export const CannotCancelOrderException = new UnprocessableEntityException({
  message: 'Error.CannotCancelOrder',
  path: 'order',
});
