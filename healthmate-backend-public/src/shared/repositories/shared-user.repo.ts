import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model, Types } from 'mongoose';
import { NotFoundRecordException } from '../error';

@Injectable()
export class SharedUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUnique(
    uniqueObject: { email: string } | { _id: Types.ObjectId },
  ): Promise<UserDocument | null> {
    return this.userModel.findOne(uniqueObject).populate('roleId').exec();
  }

  async getUserById(id: Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id).populate('roleId').exec();
  }

  async getUserAge(id: Types.ObjectId) {
    const user = await this.userModel.findById(id).lean();

    if (!user) {
      throw NotFoundRecordException;
    }

    if (!user.dob) {
      throw new Error('User has not ser Date of birth');
    }

    const dob = new Date(user.dob);
    const today = new Date();

    return today.getFullYear() - dob.getFullYear();
  }
}
