import { Injectable } from '@nestjs/common';
import { QueryBuilder } from 'src/shared/utils/query-builder';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from 'src/shared/schemas/role.schema';
import { DeleteResult, Model, Types } from 'mongoose';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import {
  CreateRoleBodyType,
  UpdateRoleBodyType,
} from './schema/request/role.request.schema';

@Injectable()
export class RoleRepo {
  private queryBuilder: QueryBuilder<RoleDocument>;

  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {
    this.queryBuilder = new QueryBuilder<RoleDocument>(this.roleModel);
  }

  async findAll(query: QueryType) {
    const queryPermissions = await this.queryBuilder.query({
      query,
      allowedFilters: ['name'],
    });

    return queryPermissions;
  }

  findOne(id: Types.ObjectId) {
    return this.roleModel.findById(id);
  }

  create(data: CreateRoleBodyType) {
    return this.roleModel.create(data);
  }

  update(id: Types.ObjectId, data: UpdateRoleBodyType) {
    return this.roleModel.findByIdAndUpdate(id, data, { new: true }).populate({
      path: 'role',
      select: '_id name',
    });
  }

  delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.roleModel.deleteOne({ _id: id });
  }
}
