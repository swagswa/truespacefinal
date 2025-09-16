'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api';

export interface Theme {
  id: string;
  title: string;
  description: string;
  slug: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  slug: string;
  themeId: string;
  order: number;
  duration?: string | number;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export const useThemes = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ success: boolean; data: Theme[] }>('/api/themes');
      
      if (response.success) {
        setThemes(response.data);
      } else {
        setError('Не удалось загрузить темы');
      }
    } catch (err) {
      console.error('Error fetching themes:', err);
      setError('Ошибка при загрузке тем');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  return {
    themes,
    loading,
    error,
    refetch: fetchThemes
  };
};

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