'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Settings, BookOpen, Users, Save, Trash2 } from 'lucide-react';
import { IconSelector } from '@/components/ui/icon-selector';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('themes');
  
  // Theme form state
  const [themeForm, setThemeForm] = useState({
    name: '',
    description: '',
    icon: ''
  });
  
  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    name: '',
    theme: '',
    duration: '',
    date: '',
    description: ''
  });
  
  // Mock data for existing themes and lessons
  const [themes, setThemes] = useState([
    { id: 1, name: 'AI Coding', description: 'Изучение программирования с ИИ', icon: 'code', emoji: '💻' },
    { id: 2, name: 'AI Assistants', description: 'Создание и использование ИИ-помощников', icon: 'robot', emoji: '🤖' },
    { id: 3, name: 'Generative AI', description: 'Генеративный искусственный интеллект', icon: 'palette', emoji: '🎨' },
    { id: 4, name: 'Machine Learning', description: 'Алгоритмы и методы машинного обучения', icon: 'brain', emoji: '🧠' },
    { id: 5, name: 'AI Ethics', description: 'Этические аспекты искусственного интеллекта', icon: 'shield', emoji: '🛡️' },
    { id: 6, name: 'Future AI', description: 'Будущее искусственного интеллекта', icon: 'rocket', emoji: '🚀' }
  ]);
  
  const [lessons, setLessons] = useState([
    { id: 1, name: 'Введение в ИИ-программирование', theme: 'AI Coding', duration: 45, date: '2025-09-15', description: 'Основы программирования с использованием ИИ' },
    { id: 2, name: 'Создание чат-ботов', theme: 'AI Assistants', duration: 60, date: '2025-09-16', description: 'Разработка интеллектуальных помощников' },
    { id: 3, name: 'Генерация изображений', theme: 'Generative AI', duration: 50, date: '2025-09-17', description: 'Создание изображений с помощью ИИ' }
  ]);
  
  const handleCreateTheme = () => {
    if (themeForm.name && themeForm.description && themeForm.icon) {
      const iconOption = {
        'brain': '🧠', 'robot': '🤖', 'code': '💻', 'chart': '📊', 
        'shield': '🛡️', 'rocket': '🚀', 'palette': '🎨', 'gear': '⚙️',
        'lightbulb': '💡', 'book': '📚', 'microscope': '🔬', 'crystal': '💎'
      };
      
      const newTheme = {
        id: themes.length + 1,
        name: themeForm.name,
        description: themeForm.description,
        icon: themeForm.icon,
        emoji: iconOption[themeForm.icon as keyof typeof iconOption] || '📚'
      };
      
      setThemes([...themes, newTheme]);
      setThemeForm({ name: '', description: '', icon: '' });
    }
  };
  
  const handleCreateLesson = () => {
    if (lessonForm.name && lessonForm.theme && lessonForm.duration && lessonForm.date) {
      const newLesson = {
        id: lessons.length + 1,
        name: lessonForm.name,
        theme: lessonForm.theme,
        duration: parseInt(lessonForm.duration),
        date: lessonForm.date,
        description: lessonForm.description
      };
      
      setLessons([...lessons, newLesson]);
      setLessonForm({ name: '', theme: '', duration: '', date: '', description: '' });
    }
  };
  
  const handleDeleteTheme = (id: number) => {
    setThemes(themes.filter(theme => theme.id !== id));
  };
  
  const handleDeleteLesson = (id: number) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Назад</span>
              </button>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <Settings className="w-6 h-6" />
                <span>Админ панель</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/10">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('themes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'themes'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Управление темами</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('lessons')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'lessons'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Управление уроками</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'themes' && (
            <div className="space-y-6">
              {/* Add New Theme Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Добавить новую тему</h2>
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Название темы
                    </label>
                    <input
                      type="text"
                      placeholder="Введите название темы"
                      value={themeForm.name}
                      onChange={(e) => setThemeForm({...themeForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Иконка
                    </label>
                    <IconSelector
                      value={themeForm.icon}
                      onChange={(value) => setThemeForm({...themeForm, icon: value})}
                      placeholder="Выберите иконку"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Описание
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Введите описание темы"
                      value={themeForm.description}
                      onChange={(e) => setThemeForm({...themeForm, description: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleCreateTheme}
                    disabled={!themeForm.name || !themeForm.description || !themeForm.icon}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Создать тему</span>
                  </button>
                </div>
              </div>

              {/* Existing Themes List */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Существующие темы ({themes.length})</h2>
                <div className="space-y-4">
                  {themes.map((theme) => (
                    <div key={theme.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{theme.emoji}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{theme.name}</h3>
                          <p className="text-sm text-white/60">{theme.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors">
                          Редактировать
                        </button>
                        <button 
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="px-3 py-1 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Удалить</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {themes.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Пока нет созданных тем</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="space-y-6">
              {/* Add New Lesson Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Добавить новый урок</h2>
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Название урока
                    </label>
                    <input
                      type="text"
                      placeholder="Введите название урока"
                      value={lessonForm.name}
                      onChange={(e) => setLessonForm({...lessonForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Тема
                    </label>
                    <div className="relative">
                      <select 
                        value={lessonForm.theme}
                        onChange={(e) => setLessonForm({...lessonForm, theme: e.target.value})}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none cursor-pointer hover:bg-white/15 transition-colors"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="" className="bg-gray-800 text-white">Выберите тему</option>
                        {themes.map((theme) => (
                          <option key={theme.id} value={theme.name} className="bg-gray-800 text-white py-2">
                            {theme.emoji} {theme.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Длительность (минуты)
                    </label>
                    <input
                      type="number"
                      placeholder="45"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Дата
                    </label>
                    <input
                      type="date"
                      value={lessonForm.date}
                      onChange={(e) => setLessonForm({...lessonForm, date: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Описание урока
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Введите описание урока"
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleCreateLesson}
                    disabled={!lessonForm.name || !lessonForm.theme || !lessonForm.duration || !lessonForm.date}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Создать урок</span>
                  </button>
                </div>
              </div>

              {/* Existing Lessons List */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Существующие уроки ({lessons.length})</h2>
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-green-400 font-bold">{lesson.id}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{lesson.name}</h3>
                          <p className="text-sm text-white/60">
                            {lesson.theme} • {lesson.duration} мин • {new Date(lesson.date).toLocaleDateString('ru-RU')}
                          </p>
                          {lesson.description && (
                            <p className="text-white/50 text-xs mt-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors">
                          Редактировать
                        </button>
                        <button 
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="px-3 py-1 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Удалить</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {lessons.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Пока нет созданных уроков</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}