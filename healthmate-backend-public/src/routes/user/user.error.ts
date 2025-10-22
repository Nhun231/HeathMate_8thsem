import { UnprocessableEntityException } from '@nestjs/common';

export const RoleNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.RoleNotFound',
    path: 'role',
  },
]);

export const UserAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.UserAlreadyExistsException',
    path: 'email',
  },
]);

export const UserNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.UserNotFoundException',
    path: 'userId',
  },
]);

export const CanNotManipulateHigherRoleException =
  new UnprocessableEntityException([
    {
      message: 'Error.CanNotManipulateHigherRoleException',
      path: 'role',
    },
  ]);

export const CannotUpdateOrDeleteYourselfException =
  new UnprocessableEntityException([
    {
      message: 'Error.CannotUpdateOrDeleteYourselfException',
      path: 'userId',
    },
  ]);
