'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { Lesson, Subtopic } from '@/types/api';

export interface LessonWithExtras extends Lesson {
  order: number;
  videoUrl?: string;
}

export function useLessons(subtopicSlug: string) {
  const [lessons, setLessons] = useState<LessonWithExtras[]>([]);
  const [subtopic, setSubtopic] = useState<Subtopic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!subtopicSlug) {
      setLessons([]);
      setSubtopic(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.getLessonsBySlug(subtopicSlug);
      const lessonsWithExtras: LessonWithExtras[] = (data.lessons || []).map((lesson, index) => ({
        ...lesson,
        order: index + 1,
        videoUrl: (lesson as Lesson & { videoUrl?: string }).videoUrl
      }));
      setLessons(lessonsWithExtras);
      setSubtopic(data.subtopic || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки уроков');
      setLessons([]);
      setSubtopic(null);
    } finally {
      setLoading(false);
    }
  }, [subtopicSlug]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    subtopic,
    loading,
    error,
    refetch: fetchLessons
  };
}