"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Archive } from "lucide-react";
import { LessonCard } from "@/components/ui/lesson-card";
import { useRouter } from "next/navigation";


export default function ArchivePage() {
  const router = useRouter();
  const handleBack = () => {
    router.push('/machine-learning');
  };

  const handlePlayClick = (link: string) => {
    console.log('Playing lesson with link:', link);
  };

  const archiveLessons = [
    {
      category: "Машинное обучение",
      lessons: [
        {
          id: 1,
          title: "Основы статистики для ML",
          duration: "35 мин",
          description: "Статистические методы и их применение в машинном обучении",
          date: "15 авг 2024",
          link: "/machine-learning/lessons/statistics",
          completed: true
        },
        {
          id: 2,
          title: "Линейная и полиномиальная регрессия",
          duration: "45 мин",
          description: "Построение и оценка регрессионных моделей",
          date: "22 авг 2024",
          link: "/machine-learning/lessons/regression",
          completed: true
        },
        {
          id: 3,
          title: "Кластеризация данных",
          duration: "40 мин",
          description: "K-means, иерархическая кластеризация, DBSCAN",
          date: "29 авг 2024",
          link: "/machine-learning/lessons/clustering",
          completed: true
        },
        {
          id: 4,
          title: "Ансамблевые методы",
          duration: "50 мин",
          description: "Bagging, boosting, стекинг моделей",
          date: "5 сен 2024",
          link: "/machine-learning/lessons/ensemble",
          completed: true
        },
        {
          id: 5,
          title: "Обработка естественного языка",
          duration: "55 мин",
          description: "NLP техники и алгоритмы для текстовых данных",
          date: "12 сен 2024",
          link: "/machine-learning/lessons/nlp",
          completed: true
        },
        {
          id: 6,
          title: "Компьютерное зрение",
          duration: "60 мин",
          description: "CNN, обработка изображений, детекция объектов",
          date: "19 сен 2024",
          link: "/machine-learning/lessons/computer-vision",
          completed: true
        }
      ]
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
            Архив уроков
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Коллекция пройденных уроков по машинному обучению
          </p>
        </div>
        
        {/* Archive Categories */}
        <div className="max-w-4xl mx-auto w-full space-y-6 px-2">
          {archiveLessons.map((category, categoryIndex) => (
            <div key={categoryIndex} className="w-full">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 px-2">
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onPlayClick={handlePlayClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BeamsBackground>
  );
}