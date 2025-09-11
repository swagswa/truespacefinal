"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ArchivePage() {
  const router = useRouter();
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());

  const handleBack = () => {
    router.push('/ai-ethics');
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
      category: "Этика ИИ",
      lessons: [
        {
          id: 1,
          title: "История этики в технологиях",
          duration: "30 мин",
          description: "Эволюция этических принципов в IT и ИИ",
          date: "15 авг 2024"
        },
        {
          id: 2,
          title: "Алгоритмическая ответственность",
          duration: "40 мин",
          description: "Кто несет ответственность за решения ИИ",
          date: "22 авг 2024"
        },
        {
          id: 3,
          title: "Этика в автономных системах",
          duration: "45 мин",
          description: "Моральные дилеммы беспилотных автомобилей и роботов",
          date: "29 авг 2024"
        },
        {
          id: 4,
          title: "ИИ и права человека",
          duration: "50 мин",
          description: "Защита основных прав в эпоху искусственного интеллекта",
          date: "5 сен 2024"
        },
        {
          id: 5,
          title: "Регулирование ИИ",
          duration: "35 мин",
          description: "Законодательные инициативы и стандарты этичного ИИ",
          date: "12 сен 2024"
        },
        {
          id: 6,
          title: "Будущее этики ИИ",
          duration: "40 мин",
          description: "Перспективы развития этических принципов в ИИ",
          date: "19 сен 2024"
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
            Коллекция пройденных уроков по этике искусственного интеллекта
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
                {category.lessons.map((lesson) => {
                  const isExpanded = expandedLessons.has(lesson.id);
                  return (
                    <div key={lesson.id} className="w-full">
                      <Button 
                        variant="outline"
                        className="w-full h-auto p-4 sm:p-6 flex items-start justify-between bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-colors duration-200 pointer-events-auto overflow-hidden"
                        onClick={() => toggleExpanded(lesson.id)}
                      >
                        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0 pr-2">
                          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <span className="text-xs sm:text-sm font-medium text-green-400">{lesson.id}</span>
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
                            <div className="flex items-center mt-2 space-x-4">
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