import { useState, useEffect, useCallback } from 'react';

export interface AdminLesson {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  duration: number;
  subtopicId: number;
  subtopic: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLessonsResponse {
  lessons: AdminLesson[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateLessonData {
  title: string;
  description: string;
  content: string;
  duration: number;
  subtopicId: number;
}

export interface UpdateLessonData extends CreateLessonData {
  id: number;
}

export function useAdminLessons() {
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Загрузка уроков
  const fetchLessons = useCallback(async (params?: {
    page?: number;
    limit?: number;
    subtopicId?: number;
    search?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.subtopicId) searchParams.set('subtopicId', params.subtopicId.toString());
      if (params?.search) searchParams.set('search', params.search);

      const response = await fetch(`/api/admin/lessons?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch lessons: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setLessons(data.data.lessons);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch lessons');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание урока
  const createLesson = useCallback(async (lessonData: CreateLessonData): Promise<AdminLesson> => {
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

      if (!response.ok) {
        throw new Error(`Failed to create lesson: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Обновляем список уроков
        await fetchLessons({ page: pagination.page, limit: pagination.limit });
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create lesson');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLessons, pagination.page, pagination.limit]);

  // Обновление урока
  const updateLesson = useCallback(async (lessonData: UpdateLessonData): Promise<AdminLesson> => {
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

      if (!response.ok) {
        throw new Error(`Failed to update lesson: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Обновляем список уроков
        await fetchLessons({ page: pagination.page, limit: pagination.limit });
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update lesson');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLessons, pagination.page, pagination.limit]);

  // Удаление урока
  const deleteLesson = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/lessons?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete lesson: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Обновляем список уроков
        await fetchLessons({ page: pagination.page, limit: pagination.limit });
      } else {
        throw new Error(data.error || 'Failed to delete lesson');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchLessons, pagination.page, pagination.limit]);

  // Загрузка уроков при монтировании компонента
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    loading,
    error,
    pagination,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
  };
}