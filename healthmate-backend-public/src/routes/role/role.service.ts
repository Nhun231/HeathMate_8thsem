import { Injectable } from '@nestjs/common';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { DeleteResult, Types } from 'mongoose';
import { RoleRepo } from './role.repo';
import { NotFoundRoleException } from './role.error';
import {
  CreateRoleBodyType,
  UpdateRoleBodyType,
} from './schema/request/role.request.schema';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}

  async list(query: QueryType) {
    return this.roleRepo.findAll(query);
  }

  async findOne(id: string) {
    const role = await this.roleRepo.findOne(new Types.ObjectId(id));

    if (!role) {
      throw NotFoundRoleException;
    }

    return role;
  }

  async create(role: CreateRoleBodyType) {
    return this.roleRepo.create(role);
  }

  async update(id: string, role: UpdateRoleBodyType) {
    await this.findOne(id);
    return this.roleRepo.update(new Types.ObjectId(id), role);
  }

  async delete(id: string): Promise<DeleteResult> {
    await this.findOne(id);
    return this.roleRepo.delete(new Types.ObjectId(id));
  }
}
