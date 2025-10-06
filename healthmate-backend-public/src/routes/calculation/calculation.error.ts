import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export const NotFoundUserCalculationException =
  new UnprocessableEntityException('Error.NotFoundUser');

export const NotFoundCalculationException = new NotFoundException(
  'Error.NotFoundCalculation',
);
