"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calculator, Atom, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useLessons } from "@/lib/hooks/useLessons";
import { LessonCard } from "@/components/lesson/LessonCard";

import { useFavorites } from "@/lib/hooks/useFavorites";
import { useCompleted } from "@/lib/hooks/useCompleted";

// Icon mapping for different themes
const themeIcons = {
  mathematics: <Calculator className="h-8 w-8 text-white" />,
  physics: <Atom className="h-8 w-8 text-white" />,
  chemistry: <Atom className="h-8 w-8 text-white" />,
  default: <BookOpen className="h-8 w-8 text-white" />
};

export default function SubtopicSlugPage() {
  const router = useRouter();
  const params = useParams();
  const subtopicSlug = params.slug as string;

  const { lessons, loading, error, subtopic } = useLessons(subtopicSlug);
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isCompleted, toggleCompleted } = useCompleted();

  const handleBack = () => {
    router.back();
  };

  const handleToggleComplete = (lessonId: string) => {
    toggleCompleted(lessonId);
  };

  const handleToggleLike = (lessonId: string) => {
    toggleFavorite(lessonId);
  };

  const handleStartLesson = (lessonId: string) => {
    // Здесь можно добавить логику для открытия урока
    console.log(`Starting lesson: ${lessonId}`);
  };

  // Get theme icon based on subtopic theme
  const getThemeIcon = (themeSlug?: string) => {
    if (!themeSlug) return themeIcons.default;
    return themeIcons[themeSlug as keyof typeof themeIcons] || themeIcons.default;
  };

  // Show loading state if no subtopic slug yet
  if (!subtopicSlug) {
    return (
      <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-400">Загрузка...</span>
        </div>
      </BeamsBackground>
    );
  }

  return (
    <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
      {/* Back Button at top */}
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
        <div className="text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="mb-4 p-3 rounded-full bg-white/10 backdrop-blur-sm">
              {getThemeIcon(subtopic?.theme?.slug)}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {subtopic?.title || 'Загрузка...'}
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            {subtopic?.description || 'Загрузка описания...'}
          </p>
          
          {/* Lessons List */}
          <div className="max-w-4xl mx-auto space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">Загрузка уроков...</span>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-800 bg-red-900/20 p-6 text-center">
                <p className="text-red-400">Ошибка загрузки: {error}</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900/20 p-6 text-center">
                <p className="text-gray-400">Уроки не найдены</p>
              </div>
            ) : (
              lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  lessonNumber={index + 1}
                  isCompleted={isCompleted(lesson.id.toString())}
                  isLiked={isFavorite(lesson.id.toString())}
                  onToggleComplete={handleToggleComplete}
                  onToggleLike={handleToggleLike}
                  onStartLesson={handleStartLesson}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </BeamsBackground>
  );
}