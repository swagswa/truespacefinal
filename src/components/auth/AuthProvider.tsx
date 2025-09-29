'use client';

import { ReactNode, useEffect } from 'react';
import { AuthContext, useAuthState } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

interface TelegramInitDataUnsafe {
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  auth_date?: number;
  hash?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: TelegramInitDataUnsafe;
        ready: () => void;
        expand: () => void;
        close: () => void;
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
      };
    };
  }
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const authState = useAuthState();

  useEffect(() => {
    // Автоматическая аутентификация при загрузке приложения
    const autoAuthenticate = async () => {
      // Проверяем, есть ли уже сохраненная сессия
      if (authState.user) {
        return;
      }

      // Ждем загрузки Telegram WebApp
      const waitForTelegram = () => {
        return new Promise<void>((resolve) => {
          const checkTelegram = () => {
            if (window.Telegram?.WebApp) {
              window.Telegram.WebApp.ready();
              window.Telegram.WebApp.expand();
              resolve();
            } else {
              setTimeout(checkTelegram, 100);
            }
          };
          checkTelegram();
          
          // Таймаут через 5 секунд
          setTimeout(() => resolve(), 5000);
        });
      };

      await waitForTelegram();

      // Пытаемся войти через Telegram WebApp
      if (window.Telegram?.WebApp?.initData) {
        try {
          await authState.login(window.Telegram.WebApp.initData);
        } catch (error) {
          console.error('Auto-authentication failed:', error);
        }
      } else {
        console.log('Telegram WebApp data not available, running in browser mode');
      }
    };

    autoAuthenticate();
  }, [authState]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}