import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { QuerySchema } from 'src/shared/schemas/request/request.schema';
import {
  CreatePostDTO,
  GetPostDetailParamsDTO,
  UpdatePostDTO,
} from './post.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { DeleteResult } from 'mongoose';
import { IsPublic } from 'src/shared/decorators/auth.decorator';

@Controller('v1/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async list(
    @Query() query: Record<string, string>,
    @ActiveUser('userId') userId: string,
  ) {
    const parsed = QuerySchema.parse(query);
    return this.postService.list(parsed, userId);
  }

  @Get('newsfeed')
  @IsPublic()
  async getNewsFeed(@Query() query: Record<string, string>) {
    const parsed = QuerySchema.parse(query);
    return this.postService.list(parsed);
  }

  @Get(':postId')
  @IsPublic()
  async findOne(@Param() params: GetPostDetailParamsDTO) {
    return this.postService.findOne(params.postId);
  }

  @Get(':postId/authored')
  async findOneAuthored(
    @Param() params: GetPostDetailParamsDTO,
    @ActiveUser('userId') userId: string,
  ) {
    return this.postService.findOne(params.postId, userId);
  }

  @Post()
  async create(
    @Body() body: CreatePostDTO,
    @ActiveUser('userId') activeUserId: string,
  ) {
    return this.postService.create(body, activeUserId);
  }

  @Put(':postId')
  async update(
    @Param() params: GetPostDetailParamsDTO,
    @Body() body: UpdatePostDTO,
    @ActiveUser('userId') activeUserId: string,
  ) {
    return this.postService.update({
      id: params.postId,
      data: body,
      activeUserId,
    });
  }

  @Delete(':postId')
  async delete(@Param() params: GetPostDetailParamsDTO): Promise<DeleteResult> {
    return this.postService.delete(params.postId);
  }
}
