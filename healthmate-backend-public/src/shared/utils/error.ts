import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const NotFoundRecordException = new NotFoundException('Error.NotFound');

export const InvalidGenderException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidGender',
    path: 'calculate',
  },
]);

export const InvalidActivityLevelException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidActivityLevel',
    path: 'calculate',
  },
]);
