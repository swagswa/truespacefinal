'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api';
import { Subtopic, SubtopicsResponse } from '@/types/api';

interface UseSubtopicsReturn {
  subtopics: Subtopic[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  pagination?: SubtopicsResponse['pagination'];
  theme?: SubtopicsResponse['theme'];
}

const apiClient = new ApiClient();

export function useSubtopics(
  themeSlug: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): UseSubtopicsReturn {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [pagination, setPagination] = useState<SubtopicsResponse['pagination']>();
  const [theme, setTheme] = useState<SubtopicsResponse['theme']>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubtopics = useCallback(async () => {
    if (!themeSlug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getSubtopics(themeSlug, params);
      setSubtopics(response.subtopics);
      setPagination(response.pagination);
      setTheme(response.theme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subtopics');
      console.error('Failed to fetch subtopics:', err);
    } finally {
      setLoading(false);
    }
  }, [themeSlug, params]);

  useEffect(() => {
    fetchSubtopics();
  }, [fetchSubtopics]);

  return {
    subtopics,
    loading,
    error,
    refetch: fetchSubtopics,
    pagination,
    theme,
  };
}