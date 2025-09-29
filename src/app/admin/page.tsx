'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2, Loader2, AlertCircle, Settings, BookOpen, Users, FolderTree } from 'lucide-react';
import { IconSelector } from '@/components/ui/icon-selector';
import { useAdminThemes } from '@/hooks/useAdminThemes';
import { useAdminLessons } from '@/hooks/useAdminLessons';
import { useAdminSubtopics } from '@/lib/hooks/useAdminSubtopics';
import { renderIcon, getIconSymbol } from '@/lib/utils/icons';
import LessonsManager from '@/components/admin/LessonsManager';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('themes');
  
  // Используем реальные хуки для работы с API
  const {
    themes,
    loading: themesLoading,
    error: themesError,
    createTheme,
    updateTheme,
    deleteTheme,
    clearError: clearThemesError
  } = useAdminThemes();

  const {
    subtopics,
    loading: subtopicsLoading,
    error: subtopicsError,
    createSubtopic,
    updateSubtopic,
    deleteSubtopic,
  } = useAdminSubtopics();

  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    createLesson,
    updateLesson,
    deleteLesson,
    clearError: clearLessonsError
  } = useAdminLessons();
  
  // Theme form state
  const [themeForm, setThemeForm] = useState({
    name: '',
    description: '',
    icon: ''
  });
  
  // Subtopic form state
  const [subtopicForm, setSubtopicForm] = useState({
    title: '',
    description: '',
    themeId: ''
  });

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    name: '',
    theme: '',
    duration: '',
    date: '',
    description: ''
  });
  
  const handleCreateTheme = async () => {
    if (themeForm.name && themeForm.description && themeForm.icon) {
      const success = await createTheme({
        name: themeForm.name,
        description: themeForm.description,
        icon: themeForm.icon
      });
      
      if (success) {
        setThemeForm({ name: '', description: '', icon: '' });
      }
    }
  };
  
  const handleCreateSubtopic = async () => {
    if (subtopicForm.title && subtopicForm.description && subtopicForm.themeId) {
      const success = await createSubtopic({
        title: subtopicForm.title,
        description: subtopicForm.description,
        themeId: parseInt(subtopicForm.themeId)
      });
      
      if (success) {
        setSubtopicForm({ title: '', description: '', themeId: '' });
      }
    }
  };

  const handleCreateLesson = async () => {
    if (lessonForm.name && lessonForm.theme && lessonForm.duration && lessonForm.date) {
      const success = await createLesson({
        name: lessonForm.name,
        theme: lessonForm.theme,
        duration: parseInt(lessonForm.duration),
        date: lessonForm.date,
        description: lessonForm.description
      });
      
      if (success) {
        setLessonForm({ name: '', theme: '', duration: '', date: '', description: '' });
      }
    }
  };
  
  const handleDeleteTheme = async (id: number) => {
    await deleteTheme(id);
  };
  
  const handleDeleteSubtopic = async (id: number) => {
    await deleteSubtopic(id);
  };

  const handleDeleteLesson = async (id: number) => {
    await deleteLesson(id);
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
                onClick={() => setActiveTab('subtopics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'subtopics'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FolderTree className="w-4 h-4" />
                  <span>Управление сабтопиками</span>
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
                          {renderIcon(theme.icon)}
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

          {activeTab === 'subtopics' && (
            <div className="space-y-6">
              {/* Add New Subtopic Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Добавить новый сабтопик</h2>
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Название сабтопика
                    </label>
                    <input
                      type="text"
                      value={subtopicForm.title}
                      onChange={(e) => setSubtopicForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите название сабтопика"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Выберите тему
                    </label>
                    <select
                      value={subtopicForm.themeId}
                      onChange={(e) => setSubtopicForm(prev => ({ ...prev, themeId: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="" className="bg-gray-800">Выберите тему</option>
                      {themes.map((theme) => (
                        <option key={theme.id} value={theme.id} className="bg-gray-800">
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={subtopicForm.description}
                      onChange={(e) => setSubtopicForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Введите описание сабтопика"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleCreateSubtopic}
                    disabled={subtopicsLoading || !subtopicForm.title || !subtopicForm.description || !subtopicForm.themeId}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {subtopicsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Создать сабтопик</span>
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {subtopicsError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{subtopicsError}</span>
                  </div>
                </div>
              )}

              {/* Existing Subtopics */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Существующие сабтопики</h3>
                
                {subtopics.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-white/80 font-medium">Название</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium">Тема</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium">Описание</th>
                          <th className="text-left py-3 px-4 text-white/80 font-medium">Дата создания</th>
                          <th className="text-center py-3 px-4 text-white/80 font-medium">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subtopics.map((subtopic) => (
                          <tr key={subtopic.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="text-white font-medium">{subtopic.title}</div>
                              <div className="text-white/60 text-sm">/{subtopic.slug}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-white/80">
                                {subtopic.themeName || `Тема ID: ${subtopic.themeId}`}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-white/80 max-w-xs truncate">
                                {subtopic.description}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-white/60">
                              {new Date(subtopic.createdAt).toLocaleDateString('ru-RU')}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => handleDeleteSubtopic(subtopic.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Удалить сабтопик"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/60">
                    <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Пока нет созданных сабтопиков</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <LessonsManager subtopics={subtopics} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}