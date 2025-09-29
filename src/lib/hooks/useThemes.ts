'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api';
import { Theme, ThemesResponse } from '@/types/api';
import { Lesson } from '@/types/lesson';

interface UseThemesReturn {
  themes: Theme[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  pagination?: ThemesResponse['pagination'];
}

const apiClient = new ApiClient();

export function useThemes(params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): UseThemesReturn {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [pagination, setPagination] = useState<ThemesResponse['pagination']>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching themes with params:', params);
      const response = await apiClient.getThemes(params);
      console.log('✅ Themes response:', response);
      setThemes(response.themes);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch themes');
      console.error('❌ Failed to fetch themes:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return {
    themes,
    loading,
    error,
    refetch: fetchThemes,
    pagination,
  };
}

export const useTheme = (themeId: string) => {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ success: boolean; data: Theme }>(`/api/themes/${themeId}`);
      
      if (response.success) {
        setTheme(response.data);
      } else {
        setError('Не удалось загрузить тему');
      }
    } catch (err) {
      console.error('Error fetching theme:', err);
      setError('Ошибка при загрузке темы');
    } finally {
      setLoading(false);
    }
  }, [themeId]);

  useEffect(() => {
    if (themeId) {
      fetchTheme();
    }
  }, [themeId, fetchTheme]);

  return {
    theme,
    loading,
    error,
    refetch: fetchTheme
  };
};

export const useLesson = (lessonId: string) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLesson = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ success: boolean; data: Lesson }>(`/api/lessons/${lessonId}`);
      
      if (response.success) {
        setLesson(response.data);
      } else {
        setError('Не удалось загрузить урок');
      }
    } catch (err) {
      console.error('Error fetching lesson:', err);
      setError('Ошибка при загрузке урока');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId, fetchLesson]);

  return {
    lesson,
    loading,
    error,
    refetch: fetchLesson
  };
};