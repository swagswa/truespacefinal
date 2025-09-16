"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Archive } from "lucide-react";
import { LessonCard } from "@/components/ui/lesson-card";
import { useRouter } from "next/navigation";


export default function ArchivePage() {
  const router = useRouter();
  const handleBack = () => {
    router.push('/generative-ai');
  };

  const handlePlayClick = (link: string) => {
    console.log('Playing lesson with link:', link);
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
          description: "От первых автоэнкодеров до современных трансформеров",
          link: "/generative-ai/archive/lesson-1",
          completed: true
        },
        {
          id: 2,
          title: "Архитектуры нейронных сетей для генерации",
          duration: "55 мин",
          date: "Июль 2025",
          description: "GAN, VAE, Diffusion модели и их применение",
          link: "/generative-ai/archive/lesson-2",
          completed: true
        },
        {
          id: 3,
          title: "Prompt Engineering для изображений",
          duration: "45 мин",
          date: "Июнь 2025",
          description: "Создание эффективных промптов для DALL-E и Midjourney",
          link: "/generative-ai/archive/lesson-3",
          completed: true
        },
        {
          id: 4,
          title: "Fine-tuning генеративных моделей",
          duration: "50 мин",
          date: "Май 2025",
          description: "Адаптация моделей под специфические задачи",
          link: "/generative-ai/archive/lesson-4",
          completed: true
        },
        {
          id: 5,
          title: "Генерация музыки и звука с ИИ",
          duration: "55 мин",
          date: "Апрель 2025",
          description: "AIVA, Mubert и другие инструменты для создания аудио",
          link: "/generative-ai/archive/lesson-5",
          completed: true
        },
        {
          id: 6,
          title: "Коммерческое использование генеративного ИИ",
          duration: "40 мин",
          date: "Март 2025",
          description: "Бизнес-модели и монетизация ИИ-генерированного контента",
          link: "/generative-ai/archive/lesson-6",
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