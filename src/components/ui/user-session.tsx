'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, LogOut, Loader2 } from 'lucide-react';

export function UserSession() {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center gap-2 text-sm text-white">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center gap-2 text-sm text-white">
          <User className="w-4 h-4" />
          <span className="font-medium">Не авторизован</span>
        </div>
        <div className="text-xs text-white/60 mt-1">
          Откройте в Telegram WebApp
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center gap-2 text-sm text-white">
        <User className="w-4 h-4" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {user.firstName} {user.lastName || ''}
            </span>
            {user.username && (
              <span className="text-xs text-white/60">@{user.username}</span>
            )}
          </div>
          <div className="text-xs text-white/60 font-mono">
            ID: {user.telegramId}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLogout}
          className="h-6 w-6 p-0 text-white hover:bg-white/20 ml-2"
          title="Выйти"
        >
          <LogOut className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}