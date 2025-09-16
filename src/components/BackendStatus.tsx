'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface BackendStatusProps {
  className?: string;
}

export default function BackendStatus({ className = '' }: BackendStatusProps) {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBackendStatus = async () => {
    try {
      setStatus('loading');
      await apiClient.healthCheck();
      setStatus('connected');
      setLastCheck(new Date());
    } catch (error) {
      console.error('Backend connection failed:', error);
      setStatus('disconnected');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Проверяем статус каждые 30 секунд
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading':
        return 'Проверка подключения...';
      case 'connected':
        return 'Подключено к серверу';
      case 'disconnected':
        return 'Нет подключения к серверу';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-yellow-400';
      case 'connected':
        return 'text-green-400';
      case 'disconnected':
        return 'text-red-400';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {lastCheck && (
        <span className="text-xs text-gray-500">
          ({lastCheck.toLocaleTimeString('ru-RU')})
        </span>
      )}
    </div>
  );
}