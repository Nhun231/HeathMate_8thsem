import { UnprocessableEntityException } from '@nestjs/common';

export const NotFoundProfileRecordException = new UnprocessableEntityException({
  message: 'Error.NotFoundProfileRecord',
  path: 'profile',
});

export const InvalidPasswordException = new UnprocessableEntityException({
  message: 'Error.InvalidPassword',
  path: 'password',
});
