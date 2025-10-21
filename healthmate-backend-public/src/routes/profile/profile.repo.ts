import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from 'src/shared/schemas/role.schema';
import { User, UserDocument } from 'src/shared/schemas/user.schema';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async findOne(id: Types.ObjectId) {
    return this.userModel.findById(id).select('-password -roleId');
  }

  async update(id: string, data: Partial<UserDocument>) {
    return this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .select('-password')
      .populate('roleId');
  }

  async changePassword(id: string, password: string) {
    return this.userModel
      .findByIdAndUpdate(id, { password }, { new: true })
      .select('-password')
      .populate('roleId');
  }
}
