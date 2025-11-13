import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, Types } from 'mongoose';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { QueryBuilder } from 'src/shared/utils/query-builder';
import { Post, PostDocument } from './schema/post.schema';
import {
  PostCategory,
  PostCategoryDocument,
} from './schema/post-category.schema';

@Injectable()
export class PostRepository {
  private queryBuilder: QueryBuilder<PostDocument>;

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(PostCategory.name)
    private postCategoryModel: Model<PostCategoryDocument>,
  ) {
    this.queryBuilder = new QueryBuilder<PostDocument>(this.postModel);
  }

  async findAll(query: QueryType) {
    const queryPosts = await this.queryBuilder.query({
      query,
      allowedFilters: ['author', 'title', 'status'],
      populateFields: ['category','author'],
    });

    return queryPosts;
  }

  async findOne(
    where:
      | ({ _id: Types.ObjectId } & Partial<Post>)
      | { _id: Types.ObjectId; authorId: Types.ObjectId },
  ) {
    return this.postModel.findOne(where).populate('category');
  }

  async create(data: Partial<PostDocument>) {
    return this.postModel.create(data);
  }

  async update(id: Types.ObjectId, data: Partial<PostDocument>) {
    return this.postModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('category');
  }

  async delete(id: Types.ObjectId): Promise<DeleteResult> {
    return this.postModel.deleteOne({ _id: id });
  }
}
