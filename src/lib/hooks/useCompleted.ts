import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface CompletedItem {
  lessonId: string;
  completedAt: string;
}

interface CompletedResponse {
  success: boolean;
  completed: CompletedItem[];
}

interface UseCompletedReturn {
  completedLessons: Set<string>;
  isLoading: boolean;
  error: string | null;
  isCompleted: (lessonId: string) => boolean;
  toggleCompleted: (lessonId: string) => Promise<void>;
}

export function useCompleted(): UseCompletedReturn {
  const { isAuthenticated } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTelegramId = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('telegramId');
    }
    return null;
  }, []);

  const loadCompleted = useCallback(async () => {
    const telegramId = getTelegramId();
    if (!telegramId || !isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/completed', {
        headers: {
          'Authorization': `Bearer ${telegramId}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load completed lessons');
      }
      
      const data: CompletedResponse = await response.json();
      const completedIds = data.completed?.map((item) => item.lessonId) || [];
      setCompletedLessons(new Set(completedIds));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [getTelegramId, isAuthenticated]);

  const toggleCompleted = useCallback(async (lessonId: string) => {
    const telegramId = getTelegramId();
    if (!telegramId || !isAuthenticated) return;
    
    // Optimistic update
    const wasCompleted = completedLessons.has(lessonId);
    const newCompleted = new Set(completedLessons);
    
    if (wasCompleted) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
    }
    
    setCompletedLessons(newCompleted);
    
    try {
      const response = await fetch('/api/completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${telegramId}`,
        },
        body: JSON.stringify({ lessonId }),
      });
      
      if (!response.ok) {
        // Revert on error
        setCompletedLessons(completedLessons);
      }
    } catch (error) {
      console.error('Failed to toggle completed:', error);
      // Revert on error
      setCompletedLessons(completedLessons);
    }
  }, [completedLessons, getTelegramId, isAuthenticated]);

  const isCompleted = useCallback((lessonId: string) => {
    return completedLessons.has(lessonId);
  }, [completedLessons]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCompleted();
    }
  }, [isAuthenticated, loadCompleted]);

  return {
    completedLessons,
    isLoading,
    error,
    toggleCompleted,
    isCompleted,
  };
}