import { Injectable } from '@nestjs/common';
import { Rolename } from 'src/shared/constants/role.constant';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from 'src/shared/schemas/role.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class RolesService {
  private clientRoleId: Types.ObjectId;

  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async getClientRole() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }

    const role = await this.roleModel.findOne({
      name: Rolename.Customer,
      deletedAt: null,
    });

    if (!role) {
      throw new Error('Customer role not found');
    }

    this.clientRoleId = role._id;
    return role._id;
  }
}
