import { UnprocessableEntityException } from '@nestjs/common';

export const NotFoundRoleException = new UnprocessableEntityException([
  {
    message: 'Error.NotFoundRole',
    path: 'role',
  },
]);
