import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface UseFavoritesReturn {
  favorites: Set<string>;
  isLoading: boolean;
  error: string | null;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (lessonId: string) => Promise<void>;
  isFavorite: (lessonId: string) => boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const { sessionId } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'x-session-id': sessionId,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(new Set(data.favorites || []));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const toggleFavorite = useCallback(async (lessonId: string) => {
    if (!sessionId) return;
    
    // Optimistic update
    const wasFavorite = favorites.has(lessonId);
    const newFavorites = new Set(favorites);
    
    if (wasFavorite) {
      newFavorites.delete(lessonId);
    } else {
      newFavorites.add(lessonId);
    }
    
    setFavorites(newFavorites);
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ lessonId }),
      });
      
      if (!response.ok) {
        // Revert on error
        setFavorites(favorites);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert on error
      setFavorites(favorites);
    }
  }, [favorites, sessionId]);

  const isFavorite = useCallback((lessonId: string) => {
    return favorites.has(lessonId);
  }, [favorites]);

  useEffect(() => {
    if (sessionId) {
      loadFavorites();
    }
  }, [sessionId, loadFavorites]);

  return {
    favorites,
    isLoading,
    error,
    loadFavorites,
    toggleFavorite,
    isFavorite,
  };
}