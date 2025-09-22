import { Injectable } from '@nestjs/common';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { UserRepository } from './user.repo';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async getUsers(query: QueryType) {
    return this.userRepo.findAll(query);
  }

  async getUserById(id: string) {
    return this.userRepo.findOne(id);
  }

  async createUser(data: any) {
    return this.userRepo.create(data);
  }

  async updateUser(id: string, data: any) {
    return this.userRepo.update(id, data);
  }

  async deleteUser(id: string) {
    return this.userRepo.delete(id);
  }
}
