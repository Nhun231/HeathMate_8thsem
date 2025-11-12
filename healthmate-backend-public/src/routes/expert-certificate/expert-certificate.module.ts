import { Module } from '@nestjs/common';
import { ExpertCertificateController } from './expert-certificate.controller';
import { ExpertCertificateService } from './expert-certificate.service';
import { ExpertCertificateRepo } from './expert-certificate.repo';
import {
  ExpertCertificate,
  ExpertCertificateSchema,
} from './schema/expert-certificate.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/shared/schemas/user.schema';

@Module({
  controllers: [ExpertCertificateController],
  providers: [ExpertCertificateService, ExpertCertificateRepo],
  imports: [
    MongooseModule.forFeature([
      { name: ExpertCertificate.name, schema: ExpertCertificateSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class ExpertCertificateModule {}
