import React from 'react';
import { 
  Calculator, 
  Atom, 
  FlaskConical, 
  BookOpen, 
  Globe, 
  Palette, 
  Settings, 
  Users, 
  Code, 
  Bot, 
  Brain, 
  Shield, 
  Rocket,
  BarChart3,
  Lightbulb,
  Microscope,
  Gem
} from 'lucide-react';

// Общий маппинг иконок для всего приложения
export const iconMap: { [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>> } = {
  // Основные предметы
  calculator: Calculator,
  atom: Atom,
  flask: FlaskConical,
  book: BookOpen,
  globe: Globe,
  palette: Palette,
  
  // Дополнительные иконки из IconSelector
  brain: Brain,
  bot: Bot,
  code: Code,
  chart: BarChart3,
  shield: Shield,
  rocket: Rocket,
  lightbulb: Lightbulb,
  microscope: Microscope,
  gem: Gem,
  
  // Системные иконки
  settings: Settings,
  users: Users,
};

// Функция для рендеринга иконок
export const renderIcon = (iconName: string, className: string = "w-5 h-5") => {
  const IconComponent = iconMap[iconName] || BookOpen; // BookOpen как fallback
  return <IconComponent className={className} />;
};

// Функция для получения Unicode символов иконок (для выпадающих списков)
export const getIconSymbol = (iconName: string) => {
  const symbolMap: { [key: string]: string } = {
    calculator: '🧮',
    atom: '⚛️',
    flask: '🧪',
    book: '📚',
    globe: '🌍',
    palette: '🎨',
    brain: '🧠',
    bot: '🤖',
    code: '💻',
    chart: '📊',
    shield: '🛡️',
    rocket: '🚀',
    lightbulb: '💡',
    microscope: '🔬',
    gem: '💎',
    settings: '⚙️',
    users: '👥',
  };

  return symbolMap[iconName] || '📚';
};