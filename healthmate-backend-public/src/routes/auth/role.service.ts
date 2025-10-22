import { Injectable } from '@nestjs/common';
import { Rolename } from 'src/shared/constants/role.constant';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from 'src/shared/schemas/role.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class RolesService {
  private customerRoleId: Types.ObjectId;
  private expertRoleId: Types.ObjectId;

  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async getCustomerRole() {
    if (this.customerRoleId) {
      return this.customerRoleId;
    }

    const role = await this.roleModel.findOne({
      name: Rolename.Customer,
      deletedAt: null,
    });

    if (!role) {
      throw new Error('Customer role not found');
    }

    this.customerRoleId = role._id;
    return role._id;
  }

  async getExpertRole() {
    if (this.expertRoleId) {
      return this.expertRoleId;
    }

    const role = await this.roleModel.findOne({
      name: Rolename.NutritionExpert,
      deletedAt: null,
    });

    if (!role) {
      throw new Error('Nutrient Expert role not found');
    }

    this.expertRoleId = role._id;
    return role._id;
  }
}
