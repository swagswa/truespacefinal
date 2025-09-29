import { z } from 'zod';

// Lesson validation schemas
export const lessonIdSchema = z.object({
  lessonId: z.number().int().positive('Lesson ID must be a positive integer'),
});

export const sessionIdSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

// Favorites API validation
export const addFavoriteSchema = z.object({
  lessonId: z.number().int().positive('Lesson ID must be a positive integer'),
});

export const removeFavoriteSchema = z.object({
  lessonId: z.number().int().positive('Lesson ID must be a positive integer'),
});

// Completion API validation
export const markCompletedSchema = z.object({
  lessonId: z.number().int().positive('Lesson ID must be a positive integer'),
});

export const markIncompleteSchema = z.object({
  lessonId: z.number().int().positive('Lesson ID must be a positive integer'),
});

// User validation
export const userCreateSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

// Theme validation
export const themeSlugSchema = z.object({
  slug: z.string().min(1, 'Theme slug is required'),
});

// Subtopic validation
export const subtopicSlugSchema = z.object({
  slug: z.string().min(1, 'Subtopic slug is required'),
});

// Lesson validation
export const lessonSlugSchema = z.object({
  slug: z.string().min(1, 'Lesson slug is required'),
});

// Query parameters validation
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  ...paginationSchema.shape,
});

// Validate function helper
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}