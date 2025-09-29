// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Base types with auto-increment IDs
export interface Theme {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subtopic {
  id: number;
  title: string;
  slug: string;
  description: string;
  themeId: number;
  createdAt: string;
  updatedAt: string;
  theme?: Theme;
}

export interface Lesson {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  duration: number;
  subtopicId: number;
  createdAt: string;
  updatedAt: string;
  subtopic?: Subtopic;
}

export interface User {
  id: number;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFavoriteLesson {
  id: number;
  userId: number;
  lessonId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  lesson?: Lesson;
}

export interface UserLessonCompletion {
  id: number;
  userId: number;
  lessonId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  lesson?: Lesson;
}

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response types
export interface ThemesResponse {
  themes: Theme[];
  pagination: Pagination;
}

export interface SubtopicsResponse {
  subtopics: Subtopic[];
  pagination: Pagination;
  theme?: Theme;
}

export interface LessonsResponse {
  lessons: Lesson[];
  subtopic?: Subtopic;
  pagination?: Pagination;
}

export type ThemeResponse = ApiResponse<Theme>;
export type HealthResponse = ApiResponse<{ status: string; timestamp: string }>;

// Request types
export interface CreateThemeRequest {
  title: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface UpdateThemeRequest {
  title?: string;
  slug?: string;
  description?: string;
}

export interface CreateSubtopicRequest {
  title: string;
  slug: string;
  description: string;
  themeId: number;
}

export interface CreateLessonRequest {
  title: string;
  slug: string;
  description: string;
  content: string;
  subtopicId: number;
}