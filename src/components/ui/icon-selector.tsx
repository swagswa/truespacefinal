'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface IconOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

import { Brain, Bot, Code, BarChart3, Shield, Rocket, Palette, Settings, Lightbulb, Book, Microscope, Gem } from 'lucide-react';

const iconOptions: IconOption[] = [
  { value: 'brain', label: 'Мозг', icon: Brain, description: 'Для тем связанных с ИИ и мышлением' },
  { value: 'robot', label: 'Робот', icon: Bot, description: 'Для тем об автоматизации и роботах' },
  { value: 'code', label: 'Код', icon: Code, description: 'Для программирования и разработки' },
  { value: 'chart', label: 'График', icon: BarChart3, description: 'Для аналитики и данных' },
  { value: 'shield', label: 'Щит', icon: Shield, description: 'Для безопасности и этики' },
  { value: 'rocket', label: 'Ракета', icon: Rocket, description: 'Для инноваций и будущих технологий' },
  { value: 'palette', label: 'Палитра', icon: Palette, description: 'Для творчества и генеративного ИИ' },
  { value: 'gear', label: 'Шестерня', icon: Settings, description: 'Для технических процессов' },
  { value: 'lightbulb', label: 'Лампочка', icon: Lightbulb, description: 'Для идей и инноваций' },
  { value: 'book', label: 'Книга', icon: Book, description: 'Для обучения и знаний' },
  { value: 'microscope', label: 'Микроскоп', icon: Microscope, description: 'Для исследований и науки' },
  { value: 'crystal', label: 'Кристалл', icon: Gem, description: 'Для премиум контента' }
];

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function IconSelector({ value, onChange, placeholder = "Выберите иконку", className = "" }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedIcon = iconOptions.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent flex items-center justify-between hover:bg-white/15 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {selectedIcon ? (
            <>
              <selectedIcon.icon className="w-5 h-5" />
              <span>{selectedIcon.label}</span>
            </>
          ) : (
            <span className="text-white/50">{placeholder}</span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-white/60" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/60" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {iconOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-start space-x-3 ${
                value === option.value ? 'bg-blue-600/20 text-blue-400' : 'text-white'
              }`}
            >
              <option.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-white/60 mt-0.5">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}