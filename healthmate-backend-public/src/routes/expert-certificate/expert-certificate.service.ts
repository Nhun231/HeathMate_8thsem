import { Injectable } from '@nestjs/common';
import { ExpertCertificateRepo } from './expert-certificate.repo';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { DeleteResult, Types } from 'mongoose';
import {
  NotFoundExpertCertificateException,
  NotFoundUserException,
} from './expert-certificate.error';
import {
  CreateCertificateBodyType,
  UpdateCertificateBodyType,
} from './schema/request/expert-certificate.request.schema';
import { EmailService } from 'src/shared/services/email.service';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';

@Injectable()
export class ExpertCertificateService {
  constructor(
    private readonly expertCertificateRepo: ExpertCertificateRepo,
    private readonly emailService: EmailService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async list(query: QueryType) {
    return this.expertCertificateRepo.findAll(query);
  }

  async findOne(id: string) {
    const certificate = await this.expertCertificateRepo.findOne(
      new Types.ObjectId(id),
    );

    if (!certificate) {
      throw NotFoundExpertCertificateException;
    }

    return certificate;
  }

  async create({
    userId,
    data,
  }: {
    userId: string;
    data: CreateCertificateBodyType;
  }) {
    const user = await this.sharedUserRepository.getUserById( new Types.ObjectId(userId));
    if (!user) {
      throw NotFoundUserException;
    }

    await this.emailService.expertRequestSent({
      email: user.email,
      name: user.fullname,
    });

    return this.expertCertificateRepo.create({
      userId: new Types.ObjectId(userId),
      data,
    });
  }

  async update({ id, data }: { id: string; data: UpdateCertificateBodyType }) {
    const certificate = await this.findOne(id);

    const user = await this.sharedUserRepository.getUserById( new Types.ObjectId(certificate.user));
    if (!user) {
      throw NotFoundUserException;
    }

    if (data.status === 'Approved') {
      await this.emailService.approveExpertRequest({
        email: user.email,
        name: user.fullname,
      });
       user.status = 'Active';
       await user.save();
    } else if (data.status === 'Rejected') {
      await this.emailService.rejectExpertRequest({
        email: user.email,
        name: user.fullname,
      });
    }

    return this.expertCertificateRepo.update(certificate._id, data);
  }

  async delete(id: string): Promise<DeleteResult> {
    const certificate = await this.findOne(id);

    return this.expertCertificateRepo.delete(certificate._id);
  }
}
