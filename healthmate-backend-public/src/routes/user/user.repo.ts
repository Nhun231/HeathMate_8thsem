import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { Role, RoleDocument } from 'src/shared/schemas/role.schema';
import { User, UserDocument } from 'src/shared/schemas/user.schema';
import { QueryBuilderService } from 'src/shared/utils/query-builder';

@Injectable()
export class UserRepository {
  private queryBuilder: QueryBuilderService<UserDocument>;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {
    this.queryBuilder = new QueryBuilderService<UserDocument>(this.userModel);
  }

  async findAll(query: QueryType) {
    const result = await this.queryBuilder.query(query, [
      'email',
      'fullname',
      'gender',
      'phoneNumber',
      'status',
      'roleId',
    ]);
    await this.userModel.populate(result, { path: 'roleId' });
    return result;
  }

  async findOne(id: string) {
    return this.userModel.findById(id);
  }

  async create(data: Partial<UserDocument>) {
    return this.userModel.create(data);
  }

  async update(id: string, data: Partial<UserDocument>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
