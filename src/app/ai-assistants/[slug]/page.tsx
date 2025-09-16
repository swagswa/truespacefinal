"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/ui/lesson-card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useThemes } from "@/lib/hooks/useThemes";
import { useTheme } from "@/lib/hooks/useThemes";

export default function ThemePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  
  // Получаем все темы для поиска ID по slug
  const { themes, loading: themesLoading } = useThemes();
  
  // Находим тему по slug
  const currentTheme = themes.find(theme => theme.slug === slug);
  const themeId = currentTheme?.id?.toString();
  
  // Получаем детальные данные темы
  const { theme, loading: themeLoading, error } = useTheme(themeId || '');

  const handleBack = () => {
    router.push('/ai-assistants');
  };

  const toggleExpanded = (lessonId: number) => {
    setExpandedLessons(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(lessonId)) {
        newExpanded.delete(lessonId);
      } else {
        newExpanded.add(lessonId);
      }
      return newExpanded;
    });
  };

  const handlePlayClick = (link: string) => {
    window.open(link, '_blank');
  };

  const loading = themesLoading || themeLoading;

  // Показываем загрузку
  if (loading) {
    return (
      <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Загрузка темы...</span>
          </div>
        </div>
      </BeamsBackground>
    );
  }

  // Показываем ошибку
  if (error || !theme || !currentTheme) {
    return (
      <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <p className="text-lg text-red-400 mb-4">{error || 'Тема не найдена'}</p>
            <Button 
              onClick={() => router.push('/ai-assistants')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Вернуться назад
            </Button>
          </div>
        </div>
      </BeamsBackground>
    );
  }

  const lessons = theme.lessons || [];

  return (
    <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
      {/* Back Button */}
      <Button 
        onClick={handleBack}
        variant="outline"
        className="absolute top-4 left-4 z-[9999] group flex items-center space-x-2 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98]"
        size="sm"
        style={{ pointerEvents: 'auto' }}
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <span>Назад</span>
      </Button>
      
      {/* Main content */}
      <div className="flex flex-col items-center min-h-screen px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            {theme.title}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {theme.description}
          </p>
        </div>

        {/* Lessons */}
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Уроки скоро появятся</p>
            </div>
          ) : (
            lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={{
                  id: parseInt(lesson.id),
                  title: lesson.title,
                  duration: lesson.duration || 0,
                  description: lesson.description,
                  completed: false,
                  link: lesson.link
                }}
                isExpanded={expandedLessons.has(parseInt(lesson.id))}
                onToggleExpanded={() => toggleExpanded(parseInt(lesson.id))}
                onPlayClick={(link) => handlePlayClick(link)}
              />
            ))
          )}
        </div>
      </div>
    </BeamsBackground>
  );
}