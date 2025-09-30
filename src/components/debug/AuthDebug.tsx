"use client";

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export function AuthDebug() {
  const { user, isAuthenticated, sessionId, isLoading } = useAuth();
  const [telegramId, setTelegramId] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем localStorage
    if (typeof window !== 'undefined') {
      const storedTelegramId = localStorage.getItem('telegramId');
      setTelegramId(storedTelegramId);
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>isAuthenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>isLoading: {isLoading ? '⏳' : '✅'}</div>
        <div>sessionId: {sessionId || 'null'}</div>
        <div>telegramId (localStorage): {telegramId || 'null'}</div>
        <div>user: {user ? `${user.firstName} (${user.telegramId})` : 'null'}</div>
      </div>
    </div>
  );
}