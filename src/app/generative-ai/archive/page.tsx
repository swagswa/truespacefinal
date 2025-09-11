"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Clock, Calendar, Archive, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ArchivePage() {
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

  const archiveLessons = [
    {
      category: "Генеративный ИИ",
      lessons: [
        {
          id: 1,
          title: "История генеративных моделей",
          duration: "40 мин",
          date: "Август 2025",
          description: "От первых автоэнкодеров до современных трансформеров"
        },
        {
          id: 2,
          title: "Архитектуры нейронных сетей для генерации",
          duration: "55 мин",
          date: "Июль 2025",
          description: "GAN, VAE, Diffusion модели и их применение"
        },
        {
          id: 3,
          title: "Prompt Engineering для изображений",
          duration: "45 мин",
          date: "Июнь 2025",
          description: "Создание эффективных промптов для DALL-E и Midjourney"
        },
        {
          id: 4,
          title: "Fine-tuning генеративных моделей",
          duration: "50 мин",
          date: "Май 2025",
          description: "Адаптация моделей под специфические задачи"
        },
        {
          id: 5,
          title: "Генерация музыки и звука с ИИ",
          duration: "55 мин",
          date: "Апрель 2025",
          description: "AIVA, Mubert и другие инструменты для создания аудио"
        },
        {
          id: 6,
          title: "Коммерческое использование генеративного ИИ",
          duration: "40 мин",
          date: "Март 2025",
          description: "Бизнес-модели и монетизация ИИ-генерированного контента"
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
          <div className="flex items-center justify-center mb-4">
            <Archive className="h-8 w-8 text-white mr-3" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Архив уроков
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Все предыдущие уроки и материалы по генеративному ИИ
          </p>
        </div>
        
        {/* Archive Categories */}
        <div className="max-w-6xl mx-auto w-full space-y-6 px-2">
          {archiveLessons.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 flex items-center">
                <div className="w-1 h-5 sm:h-6 bg-blue-500 mr-2 sm:mr-3 rounded"></div>
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.lessons.map((lesson) => {
                  const isExpanded = expandedLessons.has(lesson.id);
                  return (
                    <div key={lesson.id} className="w-full">
                      <Button 
                        variant="outline"
                        className="w-full h-auto p-4 sm:p-6 flex items-start justify-between bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-colors duration-200 pointer-events-auto"
                        onClick={() => toggleExpanded(lesson.id)}
                      >
                        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0 pr-2">
                          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                            <span className="text-xs sm:text-sm font-medium text-gray-400">{lesson.id}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 max-w-[calc(100%-3rem)]">
                            <h3 className="text-sm sm:text-lg font-medium text-left leading-tight max-w-full">
                              {lesson.title}
                            </h3>
                            <p className={`text-xs sm:text-sm text-gray-400 mt-1 text-left leading-tight max-w-full ${
                              isExpanded 
                                ? 'whitespace-normal break-words' 
                                : 'overflow-hidden text-ellipsis whitespace-nowrap'
                            }`}>
                              {lesson.description}
                            </p>
                            <div className="flex items-center space-x-3 sm:space-x-4 mt-2">
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">{lesson.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">{lesson.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2 self-center">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                          <Play className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BeamsBackground>
  );
}