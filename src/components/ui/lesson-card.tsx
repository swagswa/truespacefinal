"use client";

import { Clock, ChevronDown, ChevronUp, Play } from "lucide-react";


interface LessonCardProps {
  lesson: {
    id: string | number;
    title: string;
    duration: string | number;
    description: string;
    completed?: boolean;
    link?: string;
  };
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onPlayClick?: (link: string) => void;
}

export function LessonCard({ 
  lesson, 
  isExpanded = false, 
  onToggleExpanded, 
  onPlayClick 
}: LessonCardProps) {
  const handlePlayClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (lesson.link) {
      if (onPlayClick) {
        onPlayClick(lesson.link);
      } else {
        window.open(lesson.link, '_blank');
      }
    }
  };

  return (
    <div className="w-full">
      <div className="w-full h-auto p-4 sm:p-6 flex items-start justify-between bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-colors duration-200 pointer-events-auto overflow-hidden rounded-md">
        <div 
          className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0 pr-2 cursor-pointer"
          onClick={onToggleExpanded}
        >
          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-medium text-blue-400">{lesson.id}</span>
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
            <div className="flex items-center mt-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="whitespace-nowrap">{typeof lesson.duration === 'number' ? `${lesson.duration} мин` : lesson.duration}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2 self-center">
          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}
          {lesson.link && (
            <button
              onClick={handlePlayClick}
              className="group p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40 transition-all duration-200 hover:scale-110 active:scale-95"
              title="Открыть урок"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 group-hover:text-blue-300 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}