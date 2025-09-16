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
    router.push('/machine-learning');
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
      title: "Введение в машинное обучение",
      duration: "45 мин",
      description: "Основные концепции, типы обучения и алгоритмы ML",
      completed: false,
      link: "https://www.figma.com"
    },
    {
      id: 2,
      title: "Подготовка данных для ML",
      duration: "60 мин",
      description: "Очистка, нормализация и feature engineering",
      completed: false,
      link: "https://www.figma.com"
    },
    {
      id: 3,
      title: "Алгоритмы классификации",
      duration: "50 мин",
      description: "Логистическая регрессия, SVM, случайный лес",
      completed: false,
      link: "https://www.figma.com"
    },
    {
      id: 4,
      title: "Нейронные сети и глубокое обучение",
      duration: "55 мин",
      description: "Основы deep learning и популярные архитектуры",
      completed: false,
      link: "https://www.figma.com"
    },
    {
      id: 5,
      title: "Оценка и валидация моделей",
      duration: "40 мин",
      description: "Метрики качества, кросс-валидация, переобучение",
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
            Актуальный курс машинного обучения
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