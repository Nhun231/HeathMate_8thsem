import { Injectable } from '@nestjs/common';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { UserRepository } from './user.repo';
import {
  CreateUserType,
  UpdateUserType,
} from './schema/request/user.request.schema';
import { HashingService } from 'src/shared/services/hashing.service';
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo';
import { DeleteResult } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hashingService: HashingService,
    private readonly sharedRoleRepository: SharedRoleRepository,
  ) { }

  async getUsers(query: QueryType) {
    return this.userRepo.findAll(query);
  }

  async getUserById(id: string) {
    return this.userRepo.findOne(id);
  }

  async createUser(data: CreateUserType) {
    data.password = await this.hashingService.hashPassword(data.password);

    const userRole = await this.sharedRoleRepository.findUnique({
      name: data.role,
    });
    if (!userRole) throw new Error('Role not found!');

    return this.userRepo.create({
      ...data,
      roleId: userRole._id,
    });
  }

  async updateUser(id: string, data: UpdateUserType) {
    if (data.role) {
      const userRole = await this.sharedRoleRepository.findUnique({
        name: data.role,
      });
      if (!userRole) throw new Error('Role not found!');

      return this.userRepo.update(id, {
        ...data,
        roleId: userRole._id,
      });
    }

    return this.userRepo.update(id, data);
  }

  async deleteUser(id: string): Promise<DeleteResult> {
    return this.userRepo.delete(id);
  }
}
