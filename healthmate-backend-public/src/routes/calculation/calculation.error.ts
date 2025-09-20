import { UnprocessableEntityException } from '@nestjs/common';

export const NotFoundUserCalculationException =
  new UnprocessableEntityException('Error.NotFoundUser');
