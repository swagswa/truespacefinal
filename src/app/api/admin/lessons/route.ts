import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { 
  createNotFoundError,
  createSuccessResponse,
  createInternalError,
  createValidationError 
} from '@/lib/api-error-handler';

// Функция для создания slug из заголовка
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[а-я]/g, (char) => {
      const map: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET - получить все уроки для админ-панели
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const subtopicId = searchParams.get('subtopicId');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Построение условий фильтрации
    const where: Prisma.LessonWhereInput = {};
    
    if (subtopicId) {
      where.subtopicId = parseInt(subtopicId);
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Получение уроков с пагинацией
    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        include: {
          subtopic: {
            include: {
              theme: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.lesson.count({ where })
    ]);

    // Форматирование данных для админ-панели
    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      content: lesson.content,
      duration: lesson.duration,
      subtopicId: lesson.subtopicId,
      subtopic: lesson.subtopic.title,
      theme: lesson.subtopic.theme.title,
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        lessons: formattedLessons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    return createInternalError(error);
  }
}

// POST - создать новый урок
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, content, duration, subtopicId } = body;

    // Валидация
    if (!title || !description || !content || !subtopicId) {
      return createValidationError('Title, description, content, and subtopicId are required');
    }

    // Проверка существования подтемы
    const subtopic = await prisma.subtopic.findUnique({
      where: { id: parseInt(subtopicId) }
    });

    if (!subtopic) {
      return createNotFoundError('Subtopic not found');
    }

    // Создание slug
    const baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Проверка уникальности slug
    while (await prisma.lesson.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Создание урока
    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug,
        description,
        content,
        duration: parseInt(duration) || 30,
        subtopicId: parseInt(subtopicId)
      },
      include: {
        subtopic: {
          include: {
            theme: true
          }
        }
      }
    });

    // Форматирование ответа
    const formattedLesson = {
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      content: lesson.content,
      duration: lesson.duration,
      subtopicId: lesson.subtopicId,
      subtopic: lesson.subtopic.title,
      theme: lesson.subtopic.theme.title,
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedLesson,
      message: 'Lesson created successfully'
    }, { status: 201 });

  } catch (error) {
    return createInternalError(error);
  }
}

// PUT - обновить урок
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, content, duration, subtopicId } = body;

    // Валидация
    if (!id) {
      return createValidationError('Lesson ID is required');
    }

    // Проверка существования урока
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingLesson) {
      return createNotFoundError('Lesson not found');
    }

    // Проверка существования подтемы (если изменяется)
    if (subtopicId && subtopicId !== existingLesson.subtopicId) {
      const subtopic = await prisma.subtopic.findUnique({
        where: { id: parseInt(subtopicId) }
      });

      if (!subtopic) {
        return createNotFoundError('Subtopic not found');
      }
    }

    // Подготовка данных для обновления
    const updateData: Prisma.LessonUpdateInput = {};
    
    if (title && title !== existingLesson.title) {
      updateData.title = title;
      // Создание нового slug если изменился заголовок
      const baseSlug = createSlug(title);
      let slug = baseSlug;
      let counter = 1;

      // Проверка уникальности slug (исключая текущий урок)
      while (await prisma.lesson.findFirst({ 
        where: { 
          slug,
          id: { not: parseInt(id) }
        } 
      })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }
    
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (subtopicId !== undefined) {
      updateData.subtopic = {
        connect: { id: parseInt(subtopicId) }
      };
    }

    // Обновление урока
    const lesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        subtopic: {
          include: {
            theme: true
          }
        }
      }
    });

    // Форматирование ответа
    const formattedLesson = {
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      content: lesson.content,
      duration: lesson.duration,
      subtopicId: lesson.subtopicId,
      subtopic: lesson.subtopic.title,
      theme: lesson.subtopic.theme.title,
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedLesson,
      message: 'Lesson updated successfully'
    });

  } catch (error) {
    return createInternalError(error);
  }
}

// DELETE - удалить урок
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createValidationError('Lesson ID is required');
    }

    // Проверка существования урока
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingLesson) {
      return createNotFoundError('Lesson not found');
    }

    // Удаление урока (каскадное удаление связанных записей настроено в схеме)
    await prisma.lesson.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    return createInternalError(error);
  }
}