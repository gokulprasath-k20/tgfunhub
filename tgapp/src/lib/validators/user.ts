import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  profileImage: z.string().url('Invalid image URL').nullable().optional(),
  isPrivate: z.boolean().optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      emailNotifications: z.boolean().optional(),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
