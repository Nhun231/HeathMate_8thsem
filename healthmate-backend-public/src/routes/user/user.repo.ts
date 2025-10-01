import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
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
    const queryUsers = await this.queryBuilder.query({
      query,
      allowedFilters: [
        'email',
        'fullname',
        'gender',
        'phoneNumber',
        'status',
        'roleId',
      ],
      populateFields: ['roleId'],
    });

    return queryUsers;
  }

  async findOne(id: string) {
    return this.userModel.findById(id).select('-password').populate('roleId');
  }

  async create(data: Partial<UserDocument>) {
    return this.userModel.create(data);
  }

  async update(id: string, data: Partial<UserDocument>) {
    return this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .select('-password')
      .populate('roleId');
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.userModel.deleteOne({ _id: id });
  }
}
