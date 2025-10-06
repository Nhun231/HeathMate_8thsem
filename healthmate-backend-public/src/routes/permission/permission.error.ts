import { UnprocessableEntityException } from '@nestjs/common';

export const PermissionAlreadyExistsException =
  new UnprocessableEntityException([
    {
      message: 'Error.PermissionAlreadyExists',
      path: 'path',
    },
  ]);
