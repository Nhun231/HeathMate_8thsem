import { Injectable } from '@nestjs/common';
import { QueryBuilder } from 'src/shared/utils/query-builder';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, Types } from 'mongoose';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import {
  ExpertCertificate,
  ExpertCertificateDocument,
} from './schema/expert-certificate.schema';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { CreateCertificateBodyType } from './schema/request/expert-certificate.request.schema';

@Injectable()
export class ExpertCertificateRepo {
  private queryBuilder: QueryBuilder<ExpertCertificateDocument>;

  constructor(
    @InjectModel(ExpertCertificate.name)
    private expertCertificateModel: Model<ExpertCertificateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.queryBuilder = new QueryBuilder<ExpertCertificateDocument>(
      this.expertCertificateModel,
    );
  }

  async findAll(query: QueryType) {
    const queryPermissions = await this.queryBuilder.query({
      query,
      allowedFilters: ['submittedAt', 'approvesAt', 'status'],
      populateFields: [
        {
          path: 'user',
        },
      ],
    });

    return queryPermissions;
  }

  findOne(id: Types.ObjectId) {
    return this.expertCertificateModel.findById(id).populate({
      path: 'user',
    });
  }

  create({
    userId,
    data,
  }: {
    userId: Types.ObjectId;
    data: CreateCertificateBodyType;
  }) {
    console.log(userId);
    console.log(data);
    return this.expertCertificateModel.create({ user: userId, ...data });
  }

  update(id: Types.ObjectId, data: Partial<ExpertCertificate>) {
    return this.expertCertificateModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate({
        path: 'user',
      });
  }

  delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.expertCertificateModel.deleteOne({ _id: id });
  }
}
