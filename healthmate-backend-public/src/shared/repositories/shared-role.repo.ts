import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { Rolename } from '../constants/role.constant';

@Injectable()
export class SharedRoleRepository {
  private clientRoleId: number | null = null;
  private adminRoleId: number | null = null;
  private nutritionExpertRoleId: number | null = null;

  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async findUnique(
    uniqueObject: { name: string } | { _id: Types.ObjectId },
  ): Promise<RoleDocument | null> {
    return this.roleModel.findOne(uniqueObject).exec();
  }

  private async getRole(rolename: string) {
    const role: RoleDocument = await this.roleModel
      .find({
        name: rolename,
      })
      .then((res: RoleDocument[]) => {
        if (res.length == 0) {
          throw new Error(`${rolename} role not found`);
        }

        return res[0];
      });
    return role;
  }

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId;
    }

    const role = await this.getRole(Rolename.Customer);

    this.clientRoleId = role.id;
    return role.id;
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId;
    }

    const role = await this.getRole(Rolename.Admin);

    this.adminRoleId = role.id;
    return role.id;
  }

  async getExpertRoleId() {
    if (this.nutritionExpertRoleId) {
      return this.nutritionExpertRoleId;
    }

    const role = await this.getRole(Rolename.NutritionExpert);

    this.nutritionExpertRoleId = role.id;
    return role.id;
  }
}
