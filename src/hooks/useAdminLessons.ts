import { useState, useEffect, useCallback } from 'react';

export interface Lesson {
  id: number;
  name: string;
  theme: string;
  themeId: number;
  duration: number;
  date: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonData {
  name: string;
  theme: string;
  duration: number;
  date: string;
  description?: string;
}

export interface UpdateLessonData extends CreateLessonData {
  id: number;
}

export function useAdminLessons(themeFilter?: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка всех уроков
  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = themeFilter 
        ? `/api/admin/lessons?theme=${encodeURIComponent(themeFilter)}`
        : '/api/admin/lessons';
        
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch lessons');
      }
      
      if (result.success) {
        setLessons(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch lessons');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  }, [themeFilter]);

  // Создание нового урока
  const createLesson = useCallback(async (lessonData: CreateLessonData): Promise<Lesson | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create lesson');
      }
      
      if (result.success) {
        const newLesson = result.data;
        setLessons(prev => [...(Array.isArray(prev) ? prev : []), newLesson]);
        return newLesson;
      } else {
        throw new Error(result.error || 'Failed to create lesson');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating lesson:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление урока
  const updateLesson = useCallback(async (lessonData: UpdateLessonData): Promise<Lesson | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update lesson');
      }
      
      if (result.success) {
        const updatedLesson = result.data;
        setLessons(prev => (Array.isArray(prev) ? prev : []).map(lesson => 
          lesson.id === updatedLesson.id ? updatedLesson : lesson
        ));
        return updatedLesson;
      } else {
        throw new Error(result.error || 'Failed to update lesson');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error updating lesson:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление урока
  const deleteLesson = useCallback(async (lessonId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/lessons?id=${lessonId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete lesson');
      }
      
      if (result.success) {
        setLessons(prev => (Array.isArray(prev) ? prev : []).filter(lesson => lesson.id !== lessonId));
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete lesson');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting lesson:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка уроков при монтировании компонента или изменении фильтра
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    loading,
    error,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    clearError: () => setError(null)
  };
}