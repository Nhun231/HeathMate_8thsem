import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';

@Injectable()
export class SharedRoleRepository {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async findUnique(
    uniqueObject: { name: string } | { _id: Types.ObjectId },
  ): Promise<RoleDocument | null> {
    return this.roleModel.findOne(uniqueObject).exec();
  }
}
