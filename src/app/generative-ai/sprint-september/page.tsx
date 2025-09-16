"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/ui/lesson-card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SprintSeptemberPage() {
  const router = useRouter();
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());

  const handleBack = () => {
    router.push('/generative-ai');
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

  const lessons = [
    {
      id: 1,
      title: "Основы генеративного ИИ",
      duration: "45 мин",
      description: "Принципы работы нейронных сетей и генеративных моделей",
      completed: false,
      link: "https://www.figma.com"
    },
    {
      id: 2,
      title: "Генерация текста с помощью ИИ",
      duration: "60 мин",
      description: "GPT модели, создание контента и копирайтинг с ИИ",
      completed: false,
      link: "https://www.figma.com"
    },
    {
      id: 3,
      title: "ИИ для создания изображений",
      duration: "50 мин",
      description: "DALL-E, Midjourney, Stable Diffusion и другие инструменты",
      completed: false,
      link: "https://www.figma.com"
    },
    {
      id: 4,
      title: "Генерация видео и аудио",
      duration: "55 мин",
      description: "Создание мультимедийного контента с помощью ИИ",
      completed: false,
      link: "https://www.figma.com"
    },
    {
      id: 5,
      title: "Этика генеративного ИИ",
      duration: "40 мин",
      description: "Авторские права, дипфейки и ответственное использование",
      completed: false,
      link: "https://www.figma.com"
    }
  ];

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
            Актуальный курс генеративного ИИ
          </p>
        </div>
        
        {/* Lessons List */}
        <div className="max-w-4xl mx-auto w-full space-y-3 px-2">
          {lessons.map((lesson) => {
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
          })}
        </div>
      </div>
    </BeamsBackground>
  );
}