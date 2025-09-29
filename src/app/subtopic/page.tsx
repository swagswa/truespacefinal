"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronRight, Loader2, BookOpen, Calculator, Atom } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSubtopics } from "@/lib/hooks/useSubtopics";
import { useLessons } from "@/lib/hooks/useLessons";
import { useEffect, useState, Suspense } from "react";

// Icon mapping for different themes
const themeIcons = {
  mathematics: <Calculator className="h-6 w-6 text-white" />,
  physics: <Atom className="h-6 w-6 text-white" />,
  chemistry: <Atom className="h-6 w-6 text-white" />,
  default: <BookOpen className="h-6 w-6 text-white" />
};

function SubtopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [themeSlug, setThemeSlug] = useState<string>('');
  const [subtopicSlug, setSubtopicSlug] = useState<string>('');
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  // Get parameters from URL
  useEffect(() => {
    const theme = searchParams.get('theme') || '';
    const subtopic = searchParams.get('subtopic') || '';
    setThemeSlug(theme);
    setSubtopicSlug(subtopic);
  }, [searchParams]);

  const { subtopics, loading: subtopicsLoading, error: subtopicsError, theme } = useSubtopics(themeSlug);
  const { lessons, loading: lessonsLoading, error: lessonsError } = useLessons(subtopicSlug);

  // Find current subtopic
  const currentSubtopic = subtopics.find(s => s.slug === subtopicSlug);

  const handleBack = () => {
    router.push(`/topic?theme=${themeSlug}`);
  };

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  // Get theme icon
  const getThemeIcon = (slug: string) => {
    return themeIcons[slug as keyof typeof themeIcons] || themeIcons.default;
  };

  // Show loading state if no parameters yet
  if (!themeSlug || !subtopicSlug) {
    return (
      <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-400">Загрузка...</span>
        </div>
      </BeamsBackground>
    );
  }

  const loading = subtopicsLoading || lessonsLoading;
  const error = subtopicsError || lessonsError;

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
        <span>Назад к {theme?.title || 'теме'}</span>
      </Button>
      
      {/* Main content */}
      <div className="flex flex-col items-center min-h-screen px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="mb-4 p-3 rounded-full bg-white/10 backdrop-blur-sm">
                {getThemeIcon(themeSlug)}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {currentSubtopic?.title || 'Загрузка...'}
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {currentSubtopic?.description || 'Загрузка описания...'}
            </p>
          </div>

          {/* Lessons */}
          <div className="space-y-4">
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
              lessons.map((lesson) => {
                const isExpanded = expandedLessons.has(lesson.id.toString());
                
                return (
                  <div 
                    key={lesson.id}
                    className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/30 hover:bg-white/10"
                  >
                    <Button
                      onClick={() => toggleLesson(lesson.id.toString())}
                      variant="ghost"
                      className="w-full h-auto p-6 flex items-center justify-between text-left hover:bg-transparent group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {lesson.description}
                          </p>
                        </div>
                      </div>
                    </Button>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-white/10">
                        <div className="pt-4 text-gray-300 leading-relaxed">
                          <p>Содержание урока &quot;{lesson.title}&quot; будет здесь...</p>
                          <p className="mt-2 text-sm text-gray-400">
                            Урок ID: {lesson.id} | Подтема: {lesson.subtopicId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </BeamsBackground>
  );
}

export default function SubtopicPage() {
  return (
    <Suspense fallback={
      <BeamsBackground className="relative min-h-screen w-full overflow-hidden bg-neutral-950">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-400">Загрузка...</span>
        </div>
      </BeamsBackground>
    }>
      <SubtopicContent />
    </Suspense>
  );
}