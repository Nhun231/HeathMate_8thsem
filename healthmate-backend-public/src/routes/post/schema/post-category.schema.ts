import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class PostCategory {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: false,
  })
  description: string;
}

export const PostCategorySchema = SchemaFactory.createForClass(PostCategory);

export type PostCategoryDocument = HydratedDocument<PostCategory>;
