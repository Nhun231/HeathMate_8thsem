import { Injectable } from '@nestjs/common';
import { QueryBuilder } from 'src/shared/utils/query-builder';
import { Permission, PermissionDocument } from './schema/permission.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from 'src/shared/schemas/role.schema';
import { DeleteResult, Model, Types } from 'mongoose';
import { QueryType } from 'src/shared/schemas/request/request.schema';

@Injectable()
export class PermissionRepo {
  private queryBuilder: QueryBuilder<PermissionDocument>;

  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {
    this.queryBuilder = new QueryBuilder<PermissionDocument>(
      this.permissionModel,
    );
  }

  async findAll(query: QueryType) {
    const queryPermissions = await this.queryBuilder.query({
      query,
      allowedFilters: ['name', 'method'],
      populateFields: [
        {
          path: 'role',
          select: '_id name',
        },
      ],
    });

    return queryPermissions;
  }

  findOne(id: Types.ObjectId) {
    return this.permissionModel.findById(id).populate({
      path: 'role',
      select: '_id name',
    });
  }

  create(data: Partial<Permission>) {
    return this.permissionModel.create(data);
  }

  update(id: Types.ObjectId, data: Partial<Permission>) {
    return this.permissionModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate({
        path: 'role',
        select: '_id name',
      });
  }

  delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.permissionModel.deleteOne({ _id: id });
  }
}
