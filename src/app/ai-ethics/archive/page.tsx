"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LessonCard } from "@/components/ui/lesson-card";
import { useRouter } from "next/navigation";


export default function ArchivePage() {
  const router = useRouter();
  const handleBack = () => {
    router.push('/ai-ethics');
  };

  const handlePlayClick = (link: string) => {
    console.log('Playing lesson with link:', link);
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
          date: "15 авг 2024",
          link: "/ai-ethics/lessons/1",
          completed: true
        },
        {
          id: 2,
          title: "Алгоритмическая ответственность",
          duration: "40 мин",
          description: "Кто несет ответственность за решения ИИ",
          date: "22 авг 2024",
          link: "/ai-ethics/lessons/2",
          completed: true
        },
        {
          id: 3,
          title: "Этика в автономных системах",
          duration: "45 мин",
          description: "Моральные дилеммы беспилотных автомобилей и роботов",
          date: "29 авг 2024",
          link: "/ai-ethics/lessons/3",
          completed: true
        },
        {
          id: 4,
          title: "ИИ и права человека",
          duration: "50 мин",
          description: "Защита основных прав в эпоху искусственного интеллекта",
          date: "5 сен 2024",
          link: "/ai-ethics/lessons/4",
          completed: true
        },
        {
          id: 5,
          title: "Регулирование ИИ",
          duration: "35 мин",
          description: "Законодательные инициативы и стандарты этичного ИИ",
          date: "12 сен 2024",
          link: "/ai-ethics/lessons/5",
          completed: true
        },
        {
          id: 6,
          title: "Будущее этики ИИ",
          duration: "40 мин",
          description: "Перспективы развития этических принципов в ИИ",
          date: "19 сен 2024",
          link: "/ai-ethics/lessons/6",
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