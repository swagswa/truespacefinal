"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/ui/lesson-card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSubtopics } from "@/lib/hooks/useSubtopics";

export default function SprintSeptemberPage() {
  const router = useRouter();
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  
  // Получаем подтемы для темы "ii-assistenty"
  const { subtopics, loading, error } = useSubtopics('ii-assistenty');

  const handleBack = () => {
    router.push('/ai-assistants');
  };

  const toggleExpanded = (lessonId: number) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const handlePlayClick = (link: string) => {
    window.open(link, '_blank');
  };

  // Показываем загрузку
  if (loading) {
    return (
      <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Загрузка уроков...</span>
          </div>
        </div>
      </BeamsBackground>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <p className="text-lg text-red-400 mb-4">{error}</p>
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

  // Находим подтему "Спринт сентябрь 2025"
  const sprintSubtopic = subtopics.find(subtopic => 
    subtopic.slug === 'sprint-september-2025' || 
    subtopic.name.includes('Спринт сентябрь 2025')
  );
  
  const lessons = sprintSubtopic?.lessons || [];

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
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Спринт сентябрь 2025
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {sprintSubtopic?.description || 'Актуальный курс ИИ Ассистентов'}
          </p>
        </div>
        
        {/* Lessons List */}
        <div className="max-w-4xl mx-auto w-full space-y-3 px-2">
          {lessons.length > 0 ? (
            lessons.map((lesson) => {
              const isExpanded = expandedLessons.has(lesson.id);
              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isExpanded={isExpanded}
                  onToggleExpanded={() => toggleExpanded(lesson.id)}
                  onPlayClick={handlePlayClick}
                />
              );
            })
          ) : (
            <div className="text-center text-white py-8">
              <p className="text-lg text-gray-400">Уроки загружаются...</p>
            </div>
          )}
        </div>
      </div>
    </BeamsBackground>
  );
}