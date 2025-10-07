import { Injectable } from '@nestjs/common';
import { PermissionRepo } from './permission.repo';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { DeleteResult, Types } from 'mongoose';
import {
  CreatePermissionBodyType,
  UpdatePermissionBodyType,
} from './schema/request/permission.request.schema';
import { NotFoundPermissionException } from './permission.error';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}

  async list(query: QueryType) {
    return this.permissionRepo.findAll(query);
  }

  async findOne(id: string) {
    const permission = await this.permissionRepo.findOne(
      new Types.ObjectId(id),
    );

    if (!permission) {
      throw NotFoundPermissionException;
    }

    return permission;
  }

  async create(permission: CreatePermissionBodyType) {
    return this.permissionRepo.create(permission);
  }

  async update(id: string, permission: UpdatePermissionBodyType) {
    await this.findOne(id);
    return this.permissionRepo.update(new Types.ObjectId(id), permission);
  }

  async delete(id: string): Promise<DeleteResult> {
    await this.findOne(id);
    return this.permissionRepo.delete(new Types.ObjectId(id));
  }
}
