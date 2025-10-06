import { Injectable } from '@nestjs/common';
import { PermissionRepo } from './permission.repo';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { DeleteResult, Types } from 'mongoose';
import {
  CreatePermissionBodyType,
  UpdatePermissionBodyType,
} from './schema/request/permission.request.schema';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}

  async list(query: QueryType) {
    return this.permissionRepo.findAll(query);
  }

  async findOne(id: string) {
    return this.permissionRepo.findOne(new Types.ObjectId(id));
  }

  async create(permission: CreatePermissionBodyType) {
    return this.permissionRepo.create(permission);
  }

  async update(id: string, permission: UpdatePermissionBodyType) {
    return this.permissionRepo.update(new Types.ObjectId(id), permission);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.permissionRepo.delete(new Types.ObjectId(id));
  }
}
