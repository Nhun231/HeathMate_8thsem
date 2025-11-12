import { UnprocessableEntityException } from '@nestjs/common';

export const NotFoundExpertCertificateException =
  new UnprocessableEntityException({
    message: 'Error.NotFoundExpertCertificate',
    path: 'expert-certificate',
  });
