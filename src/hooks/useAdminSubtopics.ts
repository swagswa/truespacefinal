import { useState, useEffect, useCallback } from 'react';

export interface Subtopic {
  id: number;
  title: string;
  slug: string;
  description: string;
  themeId: number;
  themeName?: string; // Для отображения названия темы
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubtopicData {
  title: string;
  description: string;
  themeId: number;
}

export interface UpdateSubtopicData extends CreateSubtopicData {
  id: number;
}

export function useAdminSubtopics() {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка всех сабтопиков
  const fetchSubtopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/subtopics');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch subtopics');
      }
      
      if (result.success) {
        setSubtopics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch subtopics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching subtopics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание нового сабтопика
  const createSubtopic = useCallback(async (subtopicData: CreateSubtopicData): Promise<Subtopic | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/subtopics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subtopicData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create subtopic');
      }
      
      if (result.success) {
        const newSubtopic = result.data;
        setSubtopics(prev => [...(Array.isArray(prev) ? prev : []), newSubtopic]);
        return newSubtopic;
      } else {
        throw new Error(result.error || 'Failed to create subtopic');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating subtopic:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление сабтопика
  const updateSubtopic = useCallback(async (subtopicData: UpdateSubtopicData): Promise<Subtopic | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/subtopics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subtopicData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update subtopic');
      }
      
      if (result.success) {
        const updatedSubtopic = result.data;
        setSubtopics(prev => 
          (Array.isArray(prev) ? prev : []).map(subtopic => 
            subtopic.id === updatedSubtopic.id ? updatedSubtopic : subtopic
          )
        );
        return updatedSubtopic;
      } else {
        throw new Error(result.error || 'Failed to update subtopic');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error updating subtopic:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление сабтопика
  const deleteSubtopic = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/subtopics', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete subtopic');
      }
      
      if (result.success) {
        setSubtopics(prev => (Array.isArray(prev) ? prev : []).filter(subtopic => subtopic.id !== id));
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete subtopic');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting subtopic:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка сабтопиков при монтировании компонента
  useEffect(() => {
    fetchSubtopics();
  }, [fetchSubtopics]);

  return {
    subtopics,
    loading,
    error,
    fetchSubtopics,
    createSubtopic,
    updateSubtopic,
    deleteSubtopic,
  };
}