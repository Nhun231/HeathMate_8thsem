import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BankInfo, BankInfoDocument } from './schema/bankinfo.schema';

@Injectable()
export class BankInfoRepo {
  constructor(@InjectModel(BankInfo.name) private bankInfoModel: Model<BankInfoDocument>) {}

  async create(data: Partial<BankInfo>): Promise<BankInfoDocument> {
    return this.bankInfoModel.create(data);
  }

  async findById(id: Types.ObjectId): Promise<BankInfoDocument | null> {
    return this.bankInfoModel.findById(id).exec();
  }

  async findByUserId(userId: Types.ObjectId): Promise<BankInfoDocument | null> {
    return this.bankInfoModel.findOne({ userId }).exec(); 
  }

  async update(id: Types.ObjectId, data: Partial<BankInfo>): Promise<BankInfoDocument | null> {
    return this.bankInfoModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: Types.ObjectId): Promise<void> {
    await this.bankInfoModel.deleteOne({ _id: id }).exec();
  }
}
