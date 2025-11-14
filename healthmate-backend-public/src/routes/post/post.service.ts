import { Injectable } from '@nestjs/common';
import { PostRepository } from './post.repo';
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import { DeleteResult, Types } from 'mongoose';
import { Rolename } from 'src/shared/constants/role.constant';
import { PostNotFoundException, UserNotFoundException } from './post.error';
import {
  CreatePostType,
  UpdatePostType,
} from './schema/request/post.request.schema';
import { PostStatus } from 'src/shared/constants/post.constant';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) { }

  async list(query: QueryType, activeUserId?: string) {
    let userRole;

    if (activeUserId) {
      userRole = await this.getUserRole(activeUserId);
    }

    const sortQuery = query.sort || '-createdAt';

    if (userRole === Rolename.NutritionExpert) {
      return this.postRepo.findAll({ ...query, author: activeUserId });
    } else if (userRole === Rolename.Admin) {
      return this.postRepo.findAll(query);
    } else {
      return this.postRepo.findAll({
        ...query,
        status: PostStatus.PUBLISHED,
        sort: sortQuery,
      });
    }
  }

  async findOne(id: string, activeUserId?: string) {
    let userRole;
    let post;

    if (activeUserId) {
      userRole = await this.getUserRole(activeUserId);
    }

    if (userRole === Rolename.NutritionExpert) {
      // expert who created the post
      post = await this.postRepo.findOne({
        _id: new Types.ObjectId(id),
        author: new Types.ObjectId(activeUserId),
      });
    } else if (userRole === Rolename.Admin) {
      // admin can do anything
      post = await this.postRepo.findOne({ _id: new Types.ObjectId(id) });
    } else {
      post = await this.postRepo.findOne({
        _id: new Types.ObjectId(id),
        status: PostStatus.PUBLISHED,
      });
    }

    if (!post) throw PostNotFoundException;

    return post;
  }

  async create(data: CreatePostType, activeUserId: string) {
    const activeUser = await this.sharedUserRepository.findUnique({
      _id: new Types.ObjectId(activeUserId),
    });
    if (!activeUser) throw UserNotFoundException;

    const categoryObjectIds = data.category.map(
      (cat) => new Types.ObjectId(cat),
    );

    let excerpt = '';
    if (data.content) {
      const match = data.content.match(/<p>(.*?)<\/p>/i);
      if (match && match[1]) {
        // number of characters want to show in post list card in frontend
        excerpt = match[1].slice(0, 50);
      }
    }

    const createPayload = {
      ...data,
      excerpt,
      author: activeUser._id,
      category: categoryObjectIds,
    };

    return this.postRepo.create(createPayload);
  }

  async update({
    id,
    activeUserId,
    data,
  }: {
    id: string;
    activeUserId: string;
    data: UpdatePostType;
  }) {
    const userRole = await this.getUserRole(activeUserId);

    let updatedPost;
    if (userRole === Rolename.NutritionExpert) {
      const post = await this.postRepo.findOne({
        _id: new Types.ObjectId(id),
        author: new Types.ObjectId(activeUserId),
      });
      if (!post) throw PostNotFoundException;
      updatedPost = post;
    } else if (userRole === Rolename.Admin) {
      const post = await this.postRepo.findOne({
        _id: new Types.ObjectId(id),
      });
      if (!post) throw PostNotFoundException;
      updatedPost = post;
    } else {
      throw PostNotFoundException;
    }

    let categoryObjectIds: Types.ObjectId[] = [];
    if (data.category) {
      categoryObjectIds = data.category.map((cat) => new Types.ObjectId(cat));
    }

    let excerpt = '';
    if (data.content) {
      const match = data.content.match(/<p>(.*?)<\/p>/i);
      if (match && match[1]) {
        // number of characters want to show in post list card in frontend
        excerpt = match[1].slice(0, 50);
      }
    }

    return this.postRepo.update(updatedPost._id, {
      ...data,
      excerpt,
      category: categoryObjectIds.length ? categoryObjectIds : undefined,
    });
  }

  async delete(id: string): Promise<DeleteResult> {
    // only the admin can hard delete the post, the expert can only discard it
    return this.postRepo.delete(new Types.ObjectId(id));
  }

  async getUserRole(userId: string) {
    const customerRole = await this.sharedRoleRepository.findUnique({
      name: Rolename.Customer,
    });
    if (!customerRole) throw new Error('Customer role not found!');

    const nutrientExpertRole = await this.sharedRoleRepository.findUnique({
      name: Rolename.NutritionExpert,
    });
    if (!nutrientExpertRole) throw new Error('Nutrient Expert role not found!');

    const adminRole = await this.sharedRoleRepository.findUnique({
      name: Rolename.Admin,
    });
    if (!adminRole) throw new Error('Admin role not found!');

    const activeUser = await this.sharedUserRepository.findUnique({
      _id: new Types.ObjectId(userId),
    });
    if (!activeUser) {
      return null;
    }

    if (activeUser.roleId._id.toString() === customerRole._id.toString()) {
      return Rolename.Customer;
    } else if (
      activeUser.roleId._id.toString() === nutrientExpertRole._id.toString()
    ) {
      return Rolename.NutritionExpert;
    } else if (activeUser.roleId._id.toString() === adminRole._id.toString()) {
      return Rolename.Admin;
    }
  }
}
