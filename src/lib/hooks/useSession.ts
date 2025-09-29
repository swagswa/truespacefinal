'use client';

import { useState, useEffect, useCallback } from 'react';

// Генерируем уникальный session ID для пользователя
function generateSessionId(): string {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Получаем session ID с поддержкой URL параметра ?id=
function getSessionId(): string {
  // Проверяем URL параметр ?id=
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id');
    
    if (urlId) {
      // Если есть ?id= параметр, используем его как session ID
      const sessionId = `user_${urlId}`;
      localStorage.setItem('sessionId', sessionId);
      return sessionId;
    }
  }

  // Иначе используем существующий или генерируем новый
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

export interface UseSessionReturn {
  sessionId: string;
  userId: string | null;
  setUserId: (id: string) => void;
  clearSession: () => void;
  refreshSession: () => void;
}

export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string>('');
  const [userId, setUserIdState] = useState<string | null>(null);

  const refreshSession = useCallback(() => {
    const newSessionId = getSessionId();
    setSessionId(newSessionId);
    
    // Извлекаем user ID из session ID
    const userIdMatch = newSessionId.match(/^user_(.+?)(?:_\d+)?$/);
    if (userIdMatch) {
      setUserIdState(userIdMatch[1]);
    }
  }, []);

  const setUserId = useCallback((id: string) => {
    const newSessionId = `user_${id}`;
    localStorage.setItem('sessionId', newSessionId);
    setSessionId(newSessionId);
    setUserIdState(id);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('sessionId');
    const newSessionId = generateSessionId();
    localStorage.setItem('sessionId', newSessionId);
    setSessionId(newSessionId);
    
    const userIdMatch = newSessionId.match(/^user_(.+?)_\d+$/);
    if (userIdMatch) {
      setUserIdState(userIdMatch[1]);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return {
    sessionId,
    userId,
    setUserId,
    clearSession,
    refreshSession,
  };
}