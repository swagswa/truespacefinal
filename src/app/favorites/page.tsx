'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { BeamsBackground } from '@/components/ui/beams-background';
import { Button } from '@/components/ui/button';
import { LessonCard } from '@/components/lesson/LessonCard';
import { Lesson } from '@/types/api';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { useCompleted } from '@/lib/hooks/useCompleted';
import { useAuth } from '@/hooks/useAuth';

export default function FavoritesPage() {
  const router = useRouter();
  const [favoriteLessons, setFavoriteLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  
  const { user, sessionId } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isCompleted, toggleCompleted } = useCompleted();

  const handleBack = () => {
    router.push('/');
  };

  const handleToggleComplete = (lessonId: string) => {
    toggleCompleted(lessonId);
  };

  const handleToggleLike = (lessonId: string) => {
    toggleFavorite(lessonId);
    // Reload favorite lessons after toggling
    loadFavoriteLessons();
  };

  const handleStartLesson = (lessonId: string) => {
    console.log(`Starting lesson: ${lessonId}`);
  };

  const loadFavoriteLessons = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/favorites/lessons', {
        headers: {
          'x-session-id': sessionId,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load favorite lessons');
      }
      
      const data = await response.json();
      setFavoriteLessons(data.lessons || []);
    } catch (err) {
      // Error handling could be added here if needed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadFavoriteLessons();
    }
  }, [sessionId, loadFavoriteLessons]);

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
            <div className="mb-4 p-3 rounded-full bg-red-500/20 backdrop-blur-sm">
              <Heart className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Избранные уроки
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Здесь собраны все уроки, которые вы добавили в избранное
          </p>
          
          {/* Lessons List */}
          <div className="max-w-4xl mx-auto space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">Загрузка избранных уроков...</span>
              </div>
            ) : favoriteLessons.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900/20 p-8 text-center">
                <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">У вас пока нет избранных уроков</p>
                <p className="text-gray-500 text-sm">Добавьте уроки в избранное, нажав на иконку сердца</p>
              </div>
            ) : (
              favoriteLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={{
                    ...lesson,
                    videoUrl: `/videos/${lesson.id}.mp4`,
                    subtopic: lesson.subtopic
                  }}
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