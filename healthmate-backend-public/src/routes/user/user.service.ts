import { Injectable } from '@nestjs/common';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { UserRepository } from './user.repo';
import { BadRequestException } from '@nestjs/common';

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

  private calculateAge(dob: Date | string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

   async updateUserCustomer(
    id: string,
    data: Partial<Omit<UpdateUserType, 'role' | 'status'>> & { role?: string; status?: string },
  ) {
    const existingUser = await this.userRepo.findOne(id);
    if (!existingUser) throw new BadRequestException('Người dùng không tồn tại');
    // Chặn role/status
    if ('role' in data) throw new BadRequestException('Customer không được thay đổi vai trò (role), vui lòng liên hệ với admin!');
    if ('status' in data) throw new BadRequestException('Customer không được thay đổi trạng thái (status), vui lòng liên hệ với admin!');
    if ('status' in data) throw new BadRequestException('Customer không được thay đổi số điện thoại, vui lòng liên hệ với admin!');

    // Validate dữ liệu 
    const errors: Record<string, string> = {};

    if ('fullname' in data && data.fullname) {
      const value = data.fullname;
      if (!value.trim()) errors.fullname = 'Họ và tên không được để trống';
      else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value))
        errors.fullname = 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
      else if (value.length > 64 || value.length <2) errors.fullname = 'Họ và tên tối thiểu 2 ký tự, tối đa 64 ký tự';
    }

    if ('gender' in data && data.gender) {
      if (!['Male', 'Female'].includes(data.gender))
        errors.gender = 'Chọn giới tính hợp lệ';
    }

    if ('dob' in data && data.dob) {
      const age = this.calculateAge(data.dob);
      if (age < 12) errors.dob = 'Người dùng phải ít nhất 12 tuổi';
      else if (age > 110) errors.dob = 'Tuổi tối đa là 110';
    }

    if (Object.keys(errors).length > 0) {
      console.log("coloi")
      throw new BadRequestException({ message: 'Validation failed', errors });
    }

    return this.userRepo.update(id, data);
  }


  async deleteUser(id: string): Promise<DeleteResult> {
    return this.userRepo.delete(id);
  }
}
