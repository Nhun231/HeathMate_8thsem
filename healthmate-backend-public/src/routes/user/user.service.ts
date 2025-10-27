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
import {
  CanNotManipulateHigherRoleException,
  CannotUpdateOrDeleteYourselfException,
  RoleNotFoundException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from './user.error';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hashingService: HashingService,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async getUsers(query: QueryType) {
    return this.userRepo.findAll(query);
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findOne(id);
    if (!user) throw UserNotFoundException;
    return user;
  }

  async createUser(data: CreateUserType, activeUserId: string) {
    const createUserRole = await this.sharedRoleRepository.findUnique({
      name: data.role,
    });
    if (!createUserRole) throw RoleNotFoundException;

    await this.verifyRole({
      roleIdAgent: activeUserId,
      roleIdTarget: createUserRole._id.toString(),
    });

    const existingUser = await this.sharedUserRepository.findUnique({
      email: data.email,
    });
    if (existingUser) throw UserAlreadyExistsException;

    data.password = await this.hashingService.hashPassword(data.password);

    return this.userRepo.create({
      ...data,
      roleId: createUserRole._id,
    });
  }
  async updateMe(id: string, data: UpdateUserType) {
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
  async updateUser(userId: string, data: UpdateUserType, activeUserId: string) {
    this.verifyYourself({ userAgentId: activeUserId, userTargetId: userId });

    let targetRoleId;

    if (data.role) {
      const userRole = await this.sharedRoleRepository.findUnique({
        name: data.role,
      });
      if (!userRole) throw RoleNotFoundException;

      targetRoleId = userRole._id;
    } else {
      const user = await this.userRepo.findOne(userId);
      if (!user) throw UserNotFoundException;

      targetRoleId = user.roleId._id;
    }

    await this.verifyRole({
      roleIdAgent: activeUserId,
      roleIdTarget: targetRoleId.toString(),
    });

    if (data.role) {
      return this.userRepo.update(userId, {
        ...data,
        roleId: targetRoleId,
      });
    }

    return this.userRepo.update(userId, data);
  }

  async deleteUser(
    userId: string,
    activeUserId: string,
  ): Promise<DeleteResult> {
    this.verifyYourself({ userAgentId: activeUserId, userTargetId: userId });

    const user = await this.userRepo.findOne(userId);
    if (!user) throw UserNotFoundException;

    const targetRoleId = user.roleId._id;

    await this.verifyRole({
      roleIdAgent: activeUserId,
      roleIdTarget: targetRoleId.toString(),
    });

    return this.userRepo.delete(userId);
  }

  private async verifyRole({
    roleIdAgent,
    roleIdTarget,
  }: {
    roleIdAgent: string;
    roleIdTarget: string;
  }) {
    const adminRoleId = await this.sharedRoleRepository.getAdminRoleId();

    // admin agent can do anything
    if (roleIdAgent === adminRoleId.toString()) {
      return true;
    } else {
      // if not admin, roleIdTarget must not be admin
      // lower role can't manipulate higher role
      if (roleIdTarget === adminRoleId.toString()) {
        throw CanNotManipulateHigherRoleException;
      }
      return true;
    }
  }

  private verifyYourself({
    userAgentId,
    userTargetId,
  }: {
    userAgentId: string;
    userTargetId: string;
  }) {
    if (userAgentId === userTargetId) {
      throw CannotUpdateOrDeleteYourselfException;
    }
  }
}
