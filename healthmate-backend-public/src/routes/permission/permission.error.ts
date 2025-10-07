import { UnprocessableEntityException } from '@nestjs/common';

export const PermissionAlreadyExistsException =
  new UnprocessableEntityException([
    {
      message: 'Error.PermissionAlreadyExists',
      path: 'path',
    },
  ]);

export const NotFoundPermissionException = new UnprocessableEntityException([
  {
    message: 'Error.NotFoundPermission',
    path: 'permissionId',
  },
]);
