import { Injectable } from '@nestjs/common';
import { ExpertCertificateRepo } from './expert-certificate.repo';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { DeleteResult, Types } from 'mongoose';
import { NotFoundExpertCertificateException } from './expert-certificate.error';
import {
  CreateCertificateBodyType,
  UpdateCertificateBodyType,
} from './schema/request/expert-certificate.request.schema';

@Injectable()
export class ExpertCertificateService {
  constructor(private readonly expertCertificateRepo: ExpertCertificateRepo) {}

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
    return this.expertCertificateRepo.create({
      userId: new Types.ObjectId(userId),
      data,
    });
  }

  async update({ id, data }: { id: string; data: UpdateCertificateBodyType }) {
    const certificate = await this.findOne(id);

    return this.expertCertificateRepo.update(certificate._id, data);
  }

  async delete(id: string): Promise<DeleteResult> {
    const certificate = await this.findOne(id);

    return this.expertCertificateRepo.delete(certificate._id);
  }
}
