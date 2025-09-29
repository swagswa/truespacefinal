import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface CompletedItem {
  lessonId: string;
  completedAt: string;
}

interface CompletedResponse {
  completed: CompletedItem[];
  lessons: unknown[];
}

export interface UseCompletedReturn {
  completedLessons: Set<string>;
  isLoading: boolean;
  error: string | null;
  loadCompleted: () => Promise<void>;
  toggleCompleted: (lessonId: string) => Promise<void>;
  isCompleted: (lessonId: string) => boolean;
}

export function useCompleted(): UseCompletedReturn {
  const { sessionId } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCompleted = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/completed', {
        headers: {
          'x-session-id': sessionId,
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
  }, [sessionId]);

  const toggleCompleted = useCallback(async (lessonId: string) => {
    if (!sessionId) return;
    
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
          'x-session-id': sessionId,
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
  }, [completedLessons, sessionId]);

  const isCompleted = useCallback((lessonId: string) => {
    return completedLessons.has(lessonId);
  }, [completedLessons]);

  useEffect(() => {
    if (sessionId) {
      loadCompleted();
    }
  }, [sessionId, loadCompleted]);

  return {
    completedLessons,
    isLoading,
    error,
    loadCompleted,
    toggleCompleted,
    isCompleted,
  };
}