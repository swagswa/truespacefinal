import { useState, useEffect, useCallback } from 'react';

export interface Theme {
  id: number;
  name: string;
  description: string;
  icon: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThemeData {
  name: string;
  description: string;
  icon: string;
}

export interface UpdateThemeData extends CreateThemeData {
  id: number;
}

export function useAdminThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка всех тем
  const fetchThemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/themes');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch themes');
      }
      
      if (result.success) {
        setThemes(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch themes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching themes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание новой темы
  const createTheme = useCallback(async (themeData: CreateThemeData): Promise<Theme | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create theme');
      }
      
      if (result.success) {
        const newTheme = result.data;
        setThemes(prev => [...prev, newTheme]);
        return newTheme;
      } else {
        throw new Error(result.error || 'Failed to create theme');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating theme:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление темы
  const updateTheme = useCallback(async (themeData: UpdateThemeData): Promise<Theme | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/themes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update theme');
      }
      
      if (result.success) {
        const updatedTheme = result.data;
        setThemes(prev => prev.map(theme => 
          theme.id === updatedTheme.id ? updatedTheme : theme
        ));
        return updatedTheme;
      } else {
        throw new Error(result.error || 'Failed to update theme');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error updating theme:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление темы
  const deleteTheme = useCallback(async (themeId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/themes?id=${themeId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete theme');
      }
      
      if (result.success) {
        setThemes(prev => prev.filter(theme => theme.id !== themeId));
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete theme');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting theme:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка тем при монтировании компонента
  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return {
    themes,
    loading,
    error,
    fetchThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    clearError: () => setError(null)
  };
}