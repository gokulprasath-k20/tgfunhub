import { z } from 'zod';

export const CreatePostSchema = z.object({
  text: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(280, 'Post must be 280 characters or less'),
  images: z
    .array(z.string().url('Invalid image URL'))
    .max(4, 'Maximum 4 images per post')
    .optional()
    .default([]),
});

export const CreateCommentSchema = z.object({
  postId: z.string().min(1),
  parentId: z.string().optional(),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be 500 characters or less'),
});

export const CreateReelSchema = z.object({
  text: z.string().max(280, 'Caption cannot exceed 280 characters').optional(),
  videoUrl: z.string().url('Invalid video URL'),
});

export const CreateVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  text: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  videoUrl: z.string().url('Invalid video URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type CreateReelInput = z.infer<typeof CreateReelSchema>;
export type CreateVideoInput = z.infer<typeof CreateVideoSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
