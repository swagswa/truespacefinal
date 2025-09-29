'use client';

import { useThemes } from '@/lib/hooks/useThemes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ThemesList() {
  const { themes, loading, error } = useThemes();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="ml-2 text-white">Загрузка тем...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (themes.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Темы не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Доступные темы</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <Card 
            key={theme.id} 
            className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
            onClick={() => {
              // Маппинг slug к соответствующим страницам
              const routeMapping: { [key: string]: string } = {
                'ii-assistenty': '/ai-assistants',
                'ai-coding': '/ai-coding',
                'generativnyj-ii': '/generative-ai',
                'mashinnoe-obuchenie': '/machine-learning',
                'etika-ii': '/ai-ethics',
                'budushchee-ii': '/future-ai'
              };
              
              const route = routeMapping[theme.slug] || `/themes/${theme.slug}`;
              router.push(route);
            }}
          >
            <CardHeader>
              <CardTitle className="text-white group-hover:text-blue-300 transition-colors">
                {theme.title}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {theme.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Тема</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Обновлено {new Date(theme.updatedAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  // Маппинг slug к соответствующим страницам
                  const routeMapping: { [key: string]: string } = {
                    'ii-assistenty': '/ai-assistants',
                    'ai-coding': '/ai-coding',
                    'generativnyj-ii': '/generative-ai',
                    'mashinnoe-obuchenie': '/machine-learning',
                    'etika-ii': '/ai-ethics',
                    'budushchee-ii': '/future-ai'
                  };
                  
                  const route = routeMapping[theme.slug] || `/themes/${theme.slug}`;
                  router.push(route);
                }}
              >
                Изучать
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}