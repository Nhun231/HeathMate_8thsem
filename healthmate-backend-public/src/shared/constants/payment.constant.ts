export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

export const PREFIX_PAYMENT_CODE = 'HM';

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
