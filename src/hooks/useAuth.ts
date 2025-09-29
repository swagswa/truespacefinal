import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';

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

export interface AuthState {
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

  const checkAuthCalled = useRef(false);
  const loginInProgress = useRef(false);

  // Функция для сохранения telegramId в localStorage
  const saveTelegramId = useCallback((telegramId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('telegramId', telegramId);
    }
  }, []);

  // Функция для получения telegramId из localStorage
  const getTelegramId = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('telegramId');
    }
    return null;
  }, []);

  // Функция для удаления telegramId из localStorage
  const removeTelegramId = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('telegramId');
    }
  }, []);

  // Функция для входа через Telegram
  const login = useCallback(async (initData: string): Promise<boolean> => {
    // Предотвращаем множественные одновременные попытки входа
    if (loginInProgress.current) {
      console.log('Login already in progress, skipping...');
      return false;
    }

    try {
      loginInProgress.current = true;
      setState(prev => ({ ...prev, isLoading: true }));

      // Проверяем, что initData не пустая
      if (!initData || initData.trim() === '') {
        console.error('Login failed: initData is empty');
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          user: null,
          isAuthenticated: false,
          sessionId: null
        }));
        return false;
      }

      console.log('Sending login request with initData length:', initData.length);

      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed with status:', response.status, 'Error:', errorText);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          user: null,
          isAuthenticated: false,
          sessionId: null
        }));
        return false;
      }

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success && data.data && data.data.user) {
        // Сохраняем telegramId в localStorage
        if (data.data.user.telegramId) {
          saveTelegramId(data.data.user.telegramId);
        }

        setState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
          sessionId: data.data.user.id.toString()
        });

        console.log('Login successful for user:', data.data.user.username || data.data.user.firstName);
        return true;
      } else {
        console.error('Login failed: No user data in response', data);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          user: null,
          isAuthenticated: false
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
    } finally {
      loginInProgress.current = false;
    }
  }, [saveTelegramId]);

  // Функция для выхода
  const logout = useCallback(() => {
    removeTelegramId();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      sessionId: null
    });
  }, [removeTelegramId]);

  // Функция для проверки текущей аутентификации
  const checkAuth = useCallback(async () => {
    // Предотвращаем множественные вызовы checkAuth
    if (checkAuthCalled.current) {
      return;
    }

    try {
      checkAuthCalled.current = true;
      const telegramId = getTelegramId();
      
      if (!telegramId) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const response = await fetch('/api/auth/telegram', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${telegramId}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        setState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
          sessionId: data.data.user.id.toString()
        });
      } else {
        // Токен недействителен, удаляем его
        removeTelegramId();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          sessionId: null
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      removeTelegramId();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        sessionId: null
      });
    }
  }, [getTelegramId, removeTelegramId]);

  // Проверяем аутентификацию при загрузке только один раз
  useEffect(() => {
    checkAuth();
  }, []); // Убираем checkAuth из зависимостей

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
    const telegramId = typeof window !== 'undefined' 
      ? localStorage.getItem('telegramId') 
      : null;
    
    return fetch(url, {
      headers: {
        'Authorization': telegramId ? `Bearer ${telegramId}` : '',
      },
    });
  },

  post: async (url: string, data: Record<string, unknown>) => {
    const telegramId = typeof window !== 'undefined' 
      ? localStorage.getItem('telegramId') 
      : null;
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': telegramId ? `Bearer ${telegramId}` : '',
      },
      body: JSON.stringify(data),
    });
  },

  put: async (url: string, data: Record<string, unknown>) => {
    const telegramId = typeof window !== 'undefined' 
      ? localStorage.getItem('telegramId') 
      : null;
    
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': telegramId ? `Bearer ${telegramId}` : '',
      },
      body: JSON.stringify(data),
    });
  },

  delete: async (url: string) => {
    const telegramId = typeof window !== 'undefined' 
      ? localStorage.getItem('telegramId') 
      : null;
    
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': telegramId ? `Bearer ${telegramId}` : '',
      },
    });
  }
};