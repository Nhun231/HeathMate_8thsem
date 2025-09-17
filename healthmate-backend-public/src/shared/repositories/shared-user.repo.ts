import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class SharedUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUnique(
    uniqueObject: { email: string } | { _id: Types.ObjectId },
  ): Promise<UserDocument | null> {
    return this.userModel.findOne(uniqueObject).populate('roleId').exec();
  }
}
