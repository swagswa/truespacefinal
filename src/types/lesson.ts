// Lesson types for frontend components
export interface Lesson {
  id: number;
  title: string;
  slug: string;
  content: string;
  description: string;
  duration: number;
  subtopicId: number;
  createdAt: Date;
  updatedAt: Date;
  subtopic?: {
    id: number;
    title: string;
    slug: string;
    description: string;
    themeId: number;
    theme?: {
      id: number;
      title: string;
      slug: string;
      description: string;
    };
  };
}

export interface LessonWithStatus extends Lesson {
  isCompleted?: boolean;
  isFavorite?: boolean;
}

export interface LessonProgress {
  lessonId: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface LessonFavorite {
  lessonId: number;
  isFavorite: boolean;
  favoritedAt?: Date;
}