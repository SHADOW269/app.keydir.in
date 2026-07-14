import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscore, hyphen');

export const profileSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(200).optional(),
  github: z.string().url().optional().or(z.literal('')),
  discord: z.string().optional(),
  reddit: z.string().optional(),
  monkeytype: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const productFilterSchema = z.object({
  q: z.string().optional(),
  layout: z.array(z.string()).optional(),
  caseMaterial: z.array(z.string()).optional(),
  mountType: z.array(z.string()).optional(),
  connectivity: z.array(z.string()).optional(),
  pcbType: z.array(z.string()).optional(),
  keyboardType: z.array(z.string()).optional(),
  plateMaterial: z.array(z.string()).optional(),
  switchCompat: z.array(z.string()).optional(),
  rgb: z.array(z.string()).optional(),
  vendors: z.array(z.string()).optional(),
  availability: z.array(z.string()).optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  sort: z.enum(['lowest', 'highest', 'newest', 'popular', 'vendors', 'drops']).optional(),
});

export const switchFilterSchema = z.object({
  q: z.string().optional(),
  type: z.array(z.string()).optional(),
  sound: z.array(z.string()).optional(),
  feel: z.array(z.string()).optional(),
  springMin: z.coerce.number().optional(),
  springMax: z.coerce.number().optional(),
  factoryLubed: z.boolean().optional(),
  manufacturers: z.array(z.string()).optional(),
});
