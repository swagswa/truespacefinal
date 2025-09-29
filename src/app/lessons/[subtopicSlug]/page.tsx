"use client";

import { BeamsBackground } from "@/components/ui/beams-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Loader2, Clock, Play, CheckCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useLessons } from "@/lib/hooks/useLessons";


export default function LessonsPage() {
  const router = useRouter();
  const params = useParams();
  const subtopicSlug = params.subtopicSlug as string;
  
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  const { lessons, loading, error } = useLessons(subtopicSlug);

  const handleBack = () => {
    router.back();
  };

  const handleLessonClick = (lessonId: string) => {
    // Здесь можно добавить логику для открытия урока
    console.log(`Opening lesson: ${lessonId}`);
  };

  const toggleLessonComplete = (lessonId: string) => {
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(lessonId)) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
    }
    setCompletedLessons(newCompleted);
  };

  // Получаем название подтемы из первого урока (если есть)
  const subtopicTitle = lessons.length > 0 ? 
    (typeof lessons[0].subtopic === 'string' ? lessons[0].subtopic : lessons[0].subtopic?.title) || 'Подтема' 
    : 'Загрузка...';

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
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="mb-4 p-3 rounded-full bg-white/10 backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                {subtopicTitle}
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Изучите уроки по данной подтеме
            </p>
          </div>
          
          {/* Progress Bar */}
          {lessons.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Прогресс</span>
                <span className="text-sm text-gray-400">
                  {completedLessons.size} из {lessons.length}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedLessons.size / lessons.length) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Lessons List */}
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
              lessons.map((lesson, index) => {
                const isCompleted = completedLessons.has(lesson.id.toString());
                
                return (
                  <div 
                    key={lesson.id}
                    className={`rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                      isCompleted 
                        ? 'border-green-500/50 bg-green-900/20' 
                        : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Lesson Number */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-white/10 text-white'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          
                          {/* Lesson Info */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              {lesson.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration}</span>
                              </div>
                              {lesson.videoUrl && (
                                <div className="flex items-center space-x-1">
                                  <Play className="h-3 w-3" />
                                  <span>Видео</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => toggleLessonComplete(lesson.id.toString())}
                            variant="outline"
                            size="sm"
                            className={`${
                              isCompleted
                                ? 'border-green-500 text-green-400 hover:bg-green-500/10'
                                : 'border-white/20 text-white hover:bg-white/10'
                            }`}
                          >
                            {isCompleted ? 'Завершен' : 'Отметить'}
                          </Button>
                          
                          <Button
                            onClick={() => handleLessonClick(lesson.id.toString())}
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Начать
                          </Button>
                        </div>
                      </div>
                      
                      {/* Lesson Content Preview */}
                      {lesson.content && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {lesson.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Summary */}
          {lessons.length > 0 && (
            <div className="mt-8 text-center">
              <div className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Итого уроков: {lessons.length}
                </h3>
                <p className="text-sm text-gray-400">
                  Завершено: {completedLessons.size} • Осталось: {lessons.length - completedLessons.size}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </BeamsBackground>
  );
}