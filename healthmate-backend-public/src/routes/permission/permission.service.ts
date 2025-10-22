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

  private diffRoles(oldRoles: string[], newRoles: string[]) {
    const added = newRoles.filter((r) => !oldRoles.includes(r));
    const removed = oldRoles.filter((r) => !newRoles.includes(r));
    return { added, removed };
  }

  async updateRoles(permissionId: string, newRoleIds: string[]) {
    const permission = await this.findOne(permissionId);
    const oldRoleIds = permission.role.map((r) => r._id.toString());

    const { added, removed } = this.diffRoles(oldRoleIds, newRoleIds);

    const addedObjectIds = added.map((id) => new Types.ObjectId(id));
    const removedObjectIds = removed.map((id) => new Types.ObjectId(id));

    const updatedPermission = await this.permissionRepo.updateRolesDiff(
      new Types.ObjectId(permissionId),
      addedObjectIds,
      removedObjectIds,
    );

    return {
      message: 'Permission roles updated successfully',
      added,
      removed,
      permission: updatedPermission,
    };
  }

  async bulkUpdateRoles(
    updates: { permissionId: string; roleIds: string[] }[],
  ) {
    const results: {
      permissionId: string;
      added: string[];
      removed: string[];
    }[] = [];

    for (const item of updates) {
      const result = await this.updateRoles(item.permissionId, item.roleIds);

      results.push({
        permissionId: item.permissionId,
        added: result.added,
        removed: result.removed,
      });
    }

    return {
      message: 'Bulk update completed',
      results,
    };
  }

  getModules() {
    return this.permissionRepo.getModules();
  }
}
