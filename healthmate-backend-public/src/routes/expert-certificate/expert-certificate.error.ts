import { UnprocessableEntityException } from '@nestjs/common';

export const NotFoundExpertCertificateException =
  new UnprocessableEntityException({
    message: 'Error.NotFoundExpertCertificate',
    path: 'expert-certificate',
  });

export const NotFoundUserException = new UnprocessableEntityException({
  message: 'Error.NotFoundUser',
  path: 'user',
});
