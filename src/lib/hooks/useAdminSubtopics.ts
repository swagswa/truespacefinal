'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AdminSubtopic {
  id: number;
  title: string;
  description: string;
  slug: string;
  themeId: number;
  themeName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubtopicsResponse {
  subtopics: AdminSubtopic[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateSubtopicData {
  title: string;
  description: string;
  themeId: number;
}

export interface UpdateSubtopicData {
  title?: string;
  description?: string;
  themeId?: number;
}

export function useAdminSubtopics() {
  const [subtopics, setSubtopics] = useState<AdminSubtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSubtopics = useCallback(async (currentPage = 1, search = '', themeId = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (search) params.append('search', search);
      if (themeId) params.append('themeId', themeId);

      const response = await fetch(`/api/admin/subtopics?${params}`);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке сабтопиков');
      }

      const result = await response.json();
      
      // Handle both formats: { success: true, data: [...] } and { subtopics: [...] }
      if (result.success && Array.isArray(result.data)) {
        setSubtopics(result.data);
        setTotal(result.total || result.data.length);
        setPage(result.page || 1);
        setTotalPages(result.totalPages || 1);
      } else if (result.subtopics) {
        setSubtopics(Array.isArray(result.subtopics) ? result.subtopics : []);
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);
      } else {
        setSubtopics([]);
        setTotal(0);
        setPage(1);
        setTotalPages(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubtopic = useCallback(async (data: CreateSubtopicData): Promise<AdminSubtopic> => {
    const response = await fetch('/api/admin/subtopics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при создании сабтопика');
    }

    const result = await response.json();
    const newSubtopic = result.success ? result.data : result;
    setSubtopics(prev => [newSubtopic, ...(Array.isArray(prev) ? prev : [])]);
    setTotal(prev => prev + 1);
    
    return newSubtopic;
  }, []);

  const updateSubtopic = useCallback(async (id: number, data: UpdateSubtopicData): Promise<AdminSubtopic> => {
    const response = await fetch('/api/admin/subtopics', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при обновлении сабтопика');
    }

    const result = await response.json();
    const updatedSubtopic = result.success ? result.data : result;
    setSubtopics(prev => (Array.isArray(prev) ? prev : []).map(subtopic => 
      subtopic.id === id ? updatedSubtopic : subtopic
    ));
    
    return updatedSubtopic;
  }, []);

  const deleteSubtopic = useCallback(async (id: number): Promise<void> => {
    const response = await fetch('/api/admin/subtopics', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при удалении сабтопика');
    }

    setSubtopics(prev => (Array.isArray(prev) ? prev : []).filter(subtopic => subtopic.id !== id));
    setTotal(prev => prev - 1);
  }, []);

  useEffect(() => {
    fetchSubtopics();
  }, [fetchSubtopics]);

  return {
    subtopics,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchSubtopics,
    createSubtopic,
    updateSubtopic,
    deleteSubtopic,
    refetch: () => fetchSubtopics(page),
  };
}