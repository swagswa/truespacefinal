"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Archive, Calendar, Loader2, BookOpen, Calculator, Atom } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSubtopics } from "@/lib/hooks/useSubtopics";

// Icon mapping for different themes
const themeIcons = {
  mathematics: <Calculator className="h-8 w-8 text-white" />,
  physics: <Atom className="h-8 w-8 text-white" />,
  chemistry: <Atom className="h-8 w-8 text-white" />,
  default: <BookOpen className="h-8 w-8 text-white" />
};

export default function TopicSlugPage() {
  const router = useRouter();
  const params = useParams();
  const themeSlug = params.slug as string;

  const { subtopics, loading, error, theme } = useSubtopics(themeSlug);

  const handleBack = () => {
    router.push('/');
  };

  const handleSubtopicClick = (slug: string) => {
    router.push(`/subtopic/${slug}`);
  };

  // Get theme icon
  const getThemeIcon = (slug: string) => {
    return themeIcons[slug as keyof typeof themeIcons] || themeIcons.default;
  };

  // Show loading state if no theme slug yet
  if (!themeSlug) {
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
              {getThemeIcon(themeSlug)}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {theme?.title || 'Загрузка...'}
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            {theme?.description || 'Загрузка описания...'}
          </p>
          
          {/* Course Options */}
          <div className="max-w-md mx-auto space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">Загрузка подтем...</span>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-800 bg-red-900/20 p-6 text-center">
                <p className="text-red-400">Ошибка загрузки: {error}</p>
              </div>
            ) : !subtopics || subtopics.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900/20 p-6 text-center">
                <p className="text-gray-400">Подтемы не найдены</p>
              </div>
            ) : (
              subtopics && subtopics.map((subtopic) => {
                const isArchive = subtopic.slug === 'archive';
                
                return (
                  <Button 
                    key={subtopic.id}
                    onClick={() => handleSubtopicClick(subtopic.slug)}
                    variant="outline"
                    className="group w-full h-auto p-4 flex items-start justify-start space-x-4 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-[0.98] pointer-events-auto"
                    size="lg"
                  >
                    {isArchive ? (
                      <Archive className="h-5 w-5 text-white flex-shrink-0 group-hover:rotate-12 transition-transform duration-300 mt-0.5" />
                    ) : (
                      <Calendar className="h-5 w-5 text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 mt-0.5" />
                    )}
                    <div className="flex flex-col items-start group-hover:translate-x-1 transition-transform duration-300">
                      <div className="text-base font-medium">{subtopic.title}</div>
                      <div className="text-sm text-gray-400 mt-1">{subtopic.description}</div>
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </BeamsBackground>
  );
}