import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BankInfoRepo } from './bankinfo.repo';
import { BankInfoDocument } from './schema/bankinfo.schema';
import {
  BankInfoForbiddenError,
  BankInfoNotFoundError,
} from './bankinfo.error';

@Injectable()
export class BankInfoService {
  constructor(private readonly bankInfoRepo: BankInfoRepo) {}

  private validateObjectId(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BankInfoNotFoundError('Invalid bank info ID format');
  }

  async create(data: any, userId: Types.ObjectId): Promise<BankInfoDocument> {
    const payload = { ...data, userId }; 
    return this.bankInfoRepo.create(payload);
  }

  async update(
    bankInfoId: string,
    data: any,
    userId: Types.ObjectId,
  ): Promise<BankInfoDocument> {
    this.validateObjectId(bankInfoId);

    const doc = await this.bankInfoRepo.findById(
      new Types.ObjectId(bankInfoId),
    );
    if (!doc) throw new BankInfoNotFoundError();

    if (String(doc.userId) !== String(userId))
      throw new BankInfoForbiddenError();

    const updatedDoc = await this.bankInfoRepo.update(
      new Types.ObjectId(bankInfoId),
      data,
    );

    if (!updatedDoc)
      throw new BankInfoNotFoundError('Failed to update bank info');

    return updatedDoc;
  }

  async delete(bankInfoId: string, userId: Types.ObjectId): Promise<void> {
    this.validateObjectId(bankInfoId);
    const doc = await this.bankInfoRepo.findById(
      new Types.ObjectId(bankInfoId),
    );
    if (!doc) throw new BankInfoNotFoundError();

    if (String(doc.userId) !== String(userId))
      throw new BankInfoForbiddenError();

    await this.bankInfoRepo.delete(new Types.ObjectId(bankInfoId));
  }

  async findById(
    bankInfoId: string,
    userId: Types.ObjectId,
  ): Promise<BankInfoDocument> {
    this.validateObjectId(bankInfoId);
    const doc = await this.bankInfoRepo.findById(
      new Types.ObjectId(bankInfoId),
    );
    if (!doc) throw new BankInfoNotFoundError();

    if (String(doc.userId) !== String(userId))
      throw new BankInfoForbiddenError();

    return doc;
  }

  async findByUserId(userId: Types.ObjectId): Promise<BankInfoDocument | null> {
    return this.bankInfoRepo.findByUserId(userId); 
  }
}
