'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Search, Clock, BookOpen, Save, Loader2 } from 'lucide-react';
import { useAdminLessons, CreateLessonData, UpdateLessonData, AdminLesson } from '@/lib/hooks/useAdminLessons';
import { useAdminSubtopics, AdminSubtopic } from '@/lib/hooks/useAdminSubtopics';

interface LessonFormData {
  title: string;
  description: string;
  content: string;
  duration: number;
  subtopicId: number;
}

const initialFormData: LessonFormData = {
  title: '',
  description: '',
  content: '',
  duration: 0,
  subtopicId: 0,
};

interface LessonFormProps {
  formData: LessonFormData;
  subtopics: AdminSubtopic[];
  editingLesson: AdminLesson | null;
  isSubmitting: boolean;
  onInputChange: (field: keyof LessonFormData, value: string | number) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const LessonForm = memo<LessonFormProps>(function LessonForm({ 
  formData, 
  subtopics, 
  editingLesson, 
  isSubmitting, 
  onInputChange, 
  onCancel, 
  onSubmit 
}) {
  return (
  <div className="space-y-6">
    <div className="space-y-2">
      <Label className="text-sm font-medium text-white/80">
        Название урока *
      </Label>
      <Input
        value={formData.title}
        onChange={(e) => onInputChange('title', e.target.value)}
        placeholder="Введите название урока"
        className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-blue-400"
      />
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium text-white/80">
        Сабтопик *
      </Label>
      <Select
        value={formData.subtopicId.toString()}
        onValueChange={(value) => onInputChange('subtopicId', parseInt(value))}
      >
        <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400">
          <SelectValue placeholder="Выберите сабтопик" className="text-white/50" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {subtopics?.map((subtopic) => (
            <SelectItem 
              key={subtopic.id} 
              value={subtopic.id.toString()}
              className="text-white hover:bg-gray-700 focus:bg-gray-700"
            >
              <div className="flex flex-col">
                <span className="font-medium">{subtopic.title}</span>
                <span className="text-xs text-white/60">{subtopic.themeName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium text-white/80">
        Описание
      </Label>
      <Textarea
        value={formData.description}
        onChange={(e) => onInputChange('description', e.target.value)}
        placeholder="Введите описание урока"
        rows={3}
        className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-blue-400 resize-none"
      />
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium text-white/80">
        Содержание
      </Label>
      <Textarea
        value={formData.content}
        onChange={(e) => onInputChange('content', e.target.value)}
        placeholder="Введите содержание урока"
        rows={6}
        className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-blue-400 resize-none"
      />
    </div>

    <div className="space-y-2">
      <Label className="text-sm font-medium text-white/80">
        Длительность (минуты)
      </Label>
      <Input
        type="number"
        value={formData.duration}
        onChange={(e) => onInputChange('duration', parseInt(e.target.value) || 0)}
        placeholder="Введите длительность в минутах"
        className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-blue-400"
      />
    </div>

    <div className="flex justify-end space-x-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        Отмена
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={!formData.title || !formData.subtopicId || isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-600/50"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {editingLesson ? 'Обновить урок' : 'Создать урок'}
      </Button>
    </div>
  </div>
  );
});

interface LessonsManagerProps {
  subtopics?: AdminSubtopic[];
}

export default function LessonsManager({ subtopics: propSubtopics }: LessonsManagerProps = {}) {
  const {
    lessons,
    loading,
    createLesson,
    updateLesson,
    deleteLesson,
  } = useAdminLessons();

  const { subtopics: hookSubtopics, fetchSubtopics } = useAdminSubtopics();
  const subtopics = propSubtopics || hookSubtopics || [];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [formData, setFormData] = useState<LessonFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загружаем сабтопики при монтировании
  useEffect(() => {
    fetchSubtopics();
  }, [fetchSubtopics]);

  // Фильтрация уроков
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubtopic = selectedSubtopic === 'all' || lesson.subtopicId.toString() === selectedSubtopic;
    return matchesSearch && matchesSubtopic;
  });

  const handleInputChange = useCallback((field: keyof LessonFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditingLesson(null);
  }, []);

  const handleCancel = useCallback(() => {
    if (editingLesson) {
      setIsEditDialogOpen(false);
      setEditingLesson(null);
    } else {
      setIsCreateDialogOpen(false);
    }
    resetForm();
  }, [editingLesson, resetForm]);

  const handleCreateLesson = useCallback(async () => {
    if (!formData.title || !formData.subtopicId) {
      return;
    }

    setIsSubmitting(true);
    try {
      const lessonData: CreateLessonData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        duration: formData.duration,
        subtopicId: formData.subtopicId,
      };

      const success = await createLesson(lessonData);
      if (success) {
        resetForm();
        setIsCreateDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, createLesson, resetForm]);

  const handleUpdateLesson = useCallback(async () => {
    if (!editingLesson || !formData.title || !formData.subtopicId) {
      return;
    }

    setIsSubmitting(true);
    try {
      const lessonData: UpdateLessonData = {
        id: editingLesson.id,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        duration: formData.duration,
        subtopicId: formData.subtopicId,
      };

      const success = await updateLesson(lessonData);
      if (success) {
        resetForm();
        setIsEditDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [editingLesson, formData, updateLesson, resetForm]);

  const handleSubmit = useCallback(() => {
    if (editingLesson) {
      handleUpdateLesson();
    } else {
      handleCreateLesson();
    }
  }, [editingLesson, handleUpdateLesson, handleCreateLesson]);

  const handleEditLesson = (lesson: AdminLesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      duration: lesson.duration || 0,
      subtopicId: lesson.subtopicId,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteLesson = async (id: number) => {
    const lesson = lessons.find(l => l.id === id);
    if (lesson && confirm(`Вы уверены, что хотите удалить урок "${lesson.title}"?`)) {
      await deleteLesson(id);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-white/80">Загрузка уроков...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Управление уроками</h2>
          <p className="text-white/60 mt-1">Создавайте и редактируйте уроки для ваших курсов</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Добавить урок
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Создать новый урок</DialogTitle>
              <DialogDescription className="text-white/60">
                Заполните информацию для создания нового урока
              </DialogDescription>
            </DialogHeader>
            <LessonForm
              formData={formData}
              subtopics={subtopics}
              editingLesson={editingLesson}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white/80">
              Поиск по названию
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <Input
                id="search"
                placeholder="Введите название урока..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white/80">
              Фильтр по сабтопику
            </Label>
            <Select value={selectedSubtopic} onValueChange={setSelectedSubtopic}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400">
                <SelectValue placeholder="Выберите сабтопик" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem 
                  value="all" 
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  Все сабтопики
                </SelectItem>
                {subtopics.map((subtopic) => (
                  <SelectItem 
                    key={subtopic.id} 
                    value={subtopic.id.toString()}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{subtopic.themeName}</span>
                      <span className="text-sm text-white/60">{subtopic.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white/80">
              Статус
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem 
                  value="all"
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  Все статусы
                </SelectItem>
                <SelectItem 
                  value="published"
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  Опубликованные
                </SelectItem>
                <SelectItem 
                  value="draft"
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  Черновики
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Уроки ({filteredLessons.length})
          </h3>
        </div>

        {filteredLessons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Название</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Сабтопик</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Длительность</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Дата создания</th>
                  <th className="text-center py-3 px-4 text-white/80 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson) => {
                  const subtopic = subtopics.find(s => s.id === lesson.subtopicId);
                  return (
                    <tr key={lesson.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{lesson.title}</div>
                            {lesson.description && (
                              <div className="text-white/60 text-sm mt-1 max-w-xs truncate">
                                {lesson.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white/80">
                          <div className="font-medium">{subtopic?.themeName || 'Неизвестная тема'}</div>
                          <div className="text-sm text-white/60">{subtopic?.title || 'Неизвестный сабтопик'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-white/80">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{lesson.duration || 0} мин</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white/60">
                        {new Date(lesson.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditLesson(lesson)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Редактировать урок"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Удалить урок"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-white/60">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Пока нет созданных уроков</p>
            <p className="text-sm mt-1">Создайте первый урок, нажав кнопку &quot;Добавить урок&quot;</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Редактировать урок</DialogTitle>
            <DialogDescription className="text-white/60">
              Внесите изменения в информацию урока
            </DialogDescription>
          </DialogHeader>
          <LessonForm
            formData={formData}
            subtopics={subtopics}
            editingLesson={editingLesson}
            isSubmitting={isSubmitting}
            onInputChange={handleInputChange}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

LessonsManager.displayName = 'LessonsManager';