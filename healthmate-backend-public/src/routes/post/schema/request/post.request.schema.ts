import { PostStatus } from 'src/shared/constants/post.constant';
import z from 'zod';

export const GetPostDetailParamsSchema = z.object({
  postId: z.string(),
});

export const CreatePostSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.array(z.string()),
  featuredImageUrl: z.string().optional(),
});

export const UpdatePostSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.enum([PostStatus.PUBLISHED, PostStatus.DISCARDED]).optional(),
  category: z.array(z.string()).optional(),
  featuredImageUrl: z.string().optional(),
});

export type GetPostDetailParamsType = z.infer<typeof GetPostDetailParamsSchema>;

export type CreatePostType = z.infer<typeof CreatePostSchema>;

export type UpdatePostType = z.infer<typeof UpdatePostSchema>;
