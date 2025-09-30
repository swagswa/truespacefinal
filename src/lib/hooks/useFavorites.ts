import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UseFavoritesReturn {
  favorites: Set<string>;
  isLoading: boolean;
  error: string | null;
  loadFavorites: () => Promise<void>;
  isFavorite: (lessonId: string) => boolean;
  toggleFavorite: (lessonId: string) => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const getTelegramId = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('telegramId');
    }
    return null;
  }, []);

  const loadFavorites = useCallback(async () => {
    const telegramId = getTelegramId();
    if (!telegramId || !isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${telegramId}`,
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
  }, [getTelegramId, isAuthenticated]);

  const toggleFavorite = useCallback(async (lessonId: string) => {
    const telegramId = getTelegramId();
    if (!telegramId || !isAuthenticated) return;
    
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
          'Authorization': `Bearer ${telegramId}`,
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
  }, [favorites, getTelegramId, isAuthenticated]);

  const isFavorite = useCallback((lessonId: string) => {
    return favorites.has(lessonId);
  }, [favorites]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated, loadFavorites]);

  return {
    favorites,
    isLoading,
    error,
    loadFavorites,
    toggleFavorite,
    isFavorite,
  };
}