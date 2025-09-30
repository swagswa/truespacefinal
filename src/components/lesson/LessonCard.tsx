"use client";

import { Button } from "@/components/ui/button";
import { Play, Clock, ChevronDown, ChevronUp, Check, Heart } from "lucide-react";
import { useState } from "react";
import { Lesson, Subtopic } from "@/types/api";

interface LessonCardProps {
  lesson: Lesson & {
    videoUrl?: string;
    subtopic?: Subtopic;
  };
  lessonNumber: number;
  isCompleted: boolean;
  isLiked: boolean;
  onToggleComplete: (lessonId: string) => void;
  onToggleLike: (lessonId: string) => void;
  onStartLesson: (lessonId: string) => void;
}

export function LessonCard({ 
  lesson, 
  lessonNumber, 
  isCompleted, 
  isLiked,
  onToggleComplete, 
  onToggleLike,
  onStartLesson 
}: LessonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Функция для сокращения описания
  const truncateDescription = (text: string | null | undefined, maxLength: number = 30) => {
    if (!text) return 'Описание отсутствует';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Функция для форматирования времени
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}ч ${remainingMinutes}м` : `${hours}ч`;
  };

  return (
    <div 
      className={`rounded-lg border transition-all duration-200 ${
        isCompleted 
          ? 'border-green-500/30 bg-green-900/10' 
          : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Номер урока */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isCompleted 
                ? 'bg-green-500 text-white' 
                : 'bg-white/10 text-white'
            }`}>
              {isCompleted ? <Check className="h-4 w-4" /> : lessonNumber}
            </div>
            
            {/* Информация об уроке */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-white mb-1 truncate">
                {lesson.title}
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                {isExpanded ? (lesson.description || 'Описание отсутствует') : truncateDescription(lesson.description)}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDuration(lesson.duration)}</span>
              </div>
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex items-center space-x-1 ml-2">
            {lesson.description && lesson.description.length > 30 && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              onClick={() => onToggleComplete(lesson.id.toString())}
              variant="ghost"
              size="sm"
              className={`p-2 ${
                isCompleted
                  ? 'text-green-400 hover:bg-green-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Check className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => onToggleLike(lesson.id.toString())}
              variant="ghost"
              size="sm"
              className={`p-2 ${
                isLiked
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              onClick={() => onStartLesson(lesson.id.toString())}
              variant="ghost"
              size="sm"
              className="p-2 text-blue-400 hover:bg-blue-500/10"
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}