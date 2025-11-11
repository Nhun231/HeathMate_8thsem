import { UnprocessableEntityException } from '@nestjs/common';

export const UserNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.UserPostNotFound',
    path: 'user',
  },
]);

export const PostNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.PostNotFound',
    path: 'user',
  },
]);

export const NotYourPostException = new UnprocessableEntityException([
  {
    message: 'Error.NotYourPost',
    path: 'user',
  },
]);
