import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export interface User {
  id: number;
  telegramId: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  photoUrl: string | null;
  languageCode: string | null;
  isPremium: boolean | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionId: string | null;
}

interface AuthContextType extends AuthState {
  login: (initData: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Создаем контекст для аутентификации
export const AuthContext = createContext<AuthContextType | null>(null);

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Хук для управления состоянием аутентификации
export const useAuthState = (): AuthContextType => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    sessionId: null
  });

  // Функция для сохранения токена в localStorage
  const saveSessionId = useCallback((sessionId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionId', sessionId);
    }
  }, []);

  // Функция для получения токена из localStorage
  const getSessionId = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sessionId');
    }
    return null;
  }, []);

  // Функция для удаления токена из localStorage
  const removeSessionId = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionId');
    }
  }, []);

  // Функция для входа через Telegram
  const login = useCallback(async (initData: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const { user, sessionId } = data.data;
        
        saveSessionId(sessionId);
        
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          sessionId
        });

        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          user: null,
          isAuthenticated: false,
          sessionId: null
        }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        user: null,
        isAuthenticated: false,
        sessionId: null
      }));
      return false;
    }
  }, [saveSessionId]);

  // Функция для выхода
  const logout = useCallback(() => {
    removeSessionId();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      sessionId: null
    });
  }, [removeSessionId]);

  // Функция для проверки текущей аутентификации
  const checkAuth = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      
      if (!sessionId) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const response = await fetch('/api/auth/telegram', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        setState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
          sessionId
        });
      } else {
        // Токен недействителен, удаляем его
        removeSessionId();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          sessionId: null
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      removeSessionId();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        sessionId: null
      });
    }
  }, [getSessionId, removeSessionId]);

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    logout,
    checkAuth
  };
};

// Утилитарные функции для работы с API
export const apiWithAuth = {
  get: async (url: string) => {
    const sessionId = typeof window !== 'undefined' 
      ? localStorage.getItem('sessionId') 
      : null;
    
    return fetch(url, {
      headers: {
        'Authorization': sessionId ? `Bearer ${sessionId}` : '',
      },
    });
  },

  post: async (url: string, data: Record<string, unknown>) => {
    const sessionId = typeof window !== 'undefined' 
      ? localStorage.getItem('sessionId') 
      : null;
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': sessionId ? `Bearer ${sessionId}` : '',
      },
      body: JSON.stringify(data),
    });
  },

  put: async (url: string, data: Record<string, unknown>) => {
    const sessionId = typeof window !== 'undefined' 
      ? localStorage.getItem('sessionId') 
      : null;
    
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': sessionId ? `Bearer ${sessionId}` : '',
      },
      body: JSON.stringify(data),
    });
  },

  delete: async (url: string) => {
    const sessionId = typeof window !== 'undefined' 
      ? localStorage.getItem('sessionId') 
      : null;
    
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': sessionId ? `Bearer ${sessionId}` : '',
      },
    });
  }
};