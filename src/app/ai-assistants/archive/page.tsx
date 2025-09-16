"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Archive } from "lucide-react";
import { LessonCard } from "@/components/ui/lesson-card";
import { useRouter } from "next/navigation";

import { useSubtopics } from "@/lib/hooks/useSubtopics";

export default function ArchivePage() {
  const router = useRouter();
  const { subtopics, loading, error } = useSubtopics('ii-assistenty');
  
  const handleBack = () => {
    router.push('/ai-assistants');
  };

  const handlePlayClick = (link: string) => {
    console.log('Playing lesson with link:', link);
  };

  // Найти архивную подтему
  const archiveSubtopic = subtopics?.find(subtopic => 
    subtopic.slug === 'archive' || 
    subtopic.title.toLowerCase().includes('архив')
  );

  const archiveLessons = archiveSubtopic?.lessons || [];

  if (loading) {
    return (
      <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Загрузка...</div>
        </div>
      </BeamsBackground>
    );
  }

  if (error) {
    return (
      <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-400 text-xl">Ошибка загрузки: {error}</div>
        </div>
      </BeamsBackground>
    );
  }



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
            Все предыдущие уроки и материалы по ИИ-ассистентам
          </p>
        </div>
        
        {/* Archive Lessons */}
        <div className="max-w-6xl mx-auto w-full space-y-6 px-2">
          {archiveSubtopic && (
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 flex items-center">
                <div className="w-1 h-5 sm:h-6 bg-blue-500 mr-2 sm:mr-3 rounded"></div>
                {archiveSubtopic.title}
              </h2>
              <div className="space-y-3">
                {archiveLessons.length > 0 ? (
                  archiveLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={{
                        id: lesson.id,
                        title: lesson.title,
                        duration: lesson.duration || 0,
                        description: lesson.description,
                        completed: false,
                        link: lesson.link
                      }}
                      onPlayClick={handlePlayClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-lg">Архивные уроки пока не добавлены</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!archiveSubtopic && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">Архивная секция не найдена</p>
            </div>
          )}
        </div>
      </div>
    </BeamsBackground>
  );
}