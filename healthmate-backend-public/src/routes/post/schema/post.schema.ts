import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { PostStatus } from 'src/shared/constants/post.constant';
import { User } from 'src/shared/schemas/user.schema';
import { PostCategory } from './post-category.schema';

@Schema({ timestamps: true })
export class Post {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  author: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  excerpt: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: String,
    enum: [PostStatus.PUBLISHED, PostStatus.DISCARDED],
    default: PostStatus.PUBLISHED,
    required: true,
  })
  status: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: PostCategory.name,
    required: true,
  })
  category: Types.ObjectId[];

  @Prop({
    type: String,
    required: false,
  })
  featuredImageUrl: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type PostDocument = HydratedDocument<Post>;
