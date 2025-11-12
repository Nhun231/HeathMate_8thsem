import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRepository } from './post.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/post.schema';
import {
  PostCategory,
  PostCategorySchema,
} from './schema/post-category.schema';

@Module({
  controllers: [PostController],
  providers: [PostService, PostRepository],
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostCategory.name, schema: PostCategorySchema },
    ]),
  ],
})
export class PostModule {}
