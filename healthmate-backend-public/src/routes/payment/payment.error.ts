import { UnprocessableEntityException } from '@nestjs/common';

export const NotFoundOrderException = new UnprocessableEntityException([
  {
    message: 'Error.NotFoundOrder',
    path: 'order',
  },
]);

export const NotFoundSubscriptionException = new UnprocessableEntityException([
  {
    message: 'Error.NotFoundSubscription',
    path: 'subscription',
  },
]);

export const PaymentTransactionAlreadyExistsException =
  new UnprocessableEntityException([
    {
      message: 'Error.PaymentTransactionAlreadyExistsException',
      path: 'payment-transaction',
    },
  ]);

  export const NotFoundPaymentException = new UnprocessableEntityException([
  {
    message: 'Error.NotFoundPayment',
    path: 'payment',
  },
]);
