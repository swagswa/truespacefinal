import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Функция для создания slug из названия
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9а-я]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET - получить все сабтопики
export async function GET() {
  try {
    const subtopics = await prisma.subtopic.findMany({
      include: {
        theme: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Преобразуем данные в формат, ожидаемый админ-панелью
    const formattedSubtopics = subtopics.map((subtopic) => ({
      id: subtopic.id,
      title: subtopic.title,
      description: subtopic.description,
      slug: subtopic.slug,
      themeId: subtopic.themeId,
      themeName: subtopic.theme.title,
      createdAt: subtopic.createdAt.toISOString(),
      updatedAt: subtopic.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedSubtopics,
      total: formattedSubtopics.length,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subtopics' },
      { status: 500 }
    );
  }
}

// POST - создать новый сабтопик
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, themeId } = body;

    // Валидация
    if (!title || !description || !themeId) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and themeId are required' },
        { status: 400 }
      );
    }

    const slug = createSlug(title);

    // Проверка существования темы
    const existingTheme = await prisma.theme.findUnique({
      where: { id: parseInt(themeId) }
    });

    if (!existingTheme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Проверка на дублирование названия или slug в рамках темы
    const existingSubtopic = await prisma.subtopic.findFirst({
      where: {
        AND: [
          { themeId: parseInt(themeId) },
          {
            OR: [
              { title: title.trim() },
              { slug: slug }
            ]
          }
        ]
      }
    });

    if (existingSubtopic) {
      return NextResponse.json(
        { success: false, error: 'Subtopic with this title already exists in this theme' },
        { status: 409 }
      );
    }

    // Создание нового сабтопика в базе данных
    const newSubtopic = await prisma.subtopic.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        slug,
        themeId: parseInt(themeId)
      },
      include: {
        theme: {
          select: {
            title: true
          }
        }
      }
    });

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedSubtopic = {
      id: newSubtopic.id,
      title: newSubtopic.title,
      description: newSubtopic.description,
      slug: newSubtopic.slug,
      themeId: newSubtopic.themeId,
      themeName: newSubtopic.theme.title,
      createdAt: newSubtopic.createdAt.toISOString(),
      updatedAt: newSubtopic.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedSubtopic
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating subtopic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subtopic' },
      { status: 500 }
    );
  }
}

// PUT - обновить сабтопик
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, themeId } = body;

    // Валидация
    if (!id || !title || !description || !themeId) {
      return NextResponse.json(
        { success: false, error: 'ID, title, description, and themeId are required' },
        { status: 400 }
      );
    }

    const slug = createSlug(title);

    // Проверка существования сабтопика
    const existingSubtopic = await prisma.subtopic.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSubtopic) {
      return NextResponse.json(
        { success: false, error: 'Subtopic not found' },
        { status: 404 }
      );
    }

    // Проверка существования темы
    const existingTheme = await prisma.theme.findUnique({
      where: { id: parseInt(themeId) }
    });

    if (!existingTheme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Проверка на дублирование названия или slug в рамках темы (исключая текущий сабтопик)
    const duplicateSubtopic = await prisma.subtopic.findFirst({
      where: {
        AND: [
          { id: { not: parseInt(id) } },
          { themeId: parseInt(themeId) },
          {
            OR: [
              { title: title.trim() },
              { slug: slug }
            ]
          }
        ]
      }
    });

    if (duplicateSubtopic) {
      return NextResponse.json(
        { success: false, error: 'Subtopic with this title already exists in this theme' },
        { status: 409 }
      );
    }

    // Обновление сабтопика в базе данных
    const updatedSubtopic = await prisma.subtopic.update({
      where: { id: parseInt(id) },
      data: {
        title: title.trim(),
        description: description.trim(),
        slug,
        themeId: parseInt(themeId)
      },
      include: {
        theme: {
          select: {
            title: true
          }
        }
      }
    });

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedSubtopic = {
      id: updatedSubtopic.id,
      title: updatedSubtopic.title,
      description: updatedSubtopic.description,
      slug: updatedSubtopic.slug,
      themeId: updatedSubtopic.themeId,
      themeName: updatedSubtopic.theme.title,
      createdAt: updatedSubtopic.createdAt.toISOString(),
      updatedAt: updatedSubtopic.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedSubtopic
    });

  } catch (error) {
    console.error('Error updating subtopic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subtopic' },
      { status: 500 }
    );
  }
}

// DELETE - удалить сабтопик
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Subtopic ID is required' },
        { status: 400 }
      );
    }

    const subtopicId = parseInt(id);

    // Проверка существования сабтопика
    const existingSubtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId },
      include: {
        theme: {
          select: {
            title: true
          }
        }
      }
    });
    
    if (!existingSubtopic) {
      return NextResponse.json(
        { success: false, error: 'Subtopic not found' },
        { status: 404 }
      );
    }

    // Удаление сабтопика из базы данных
    const deletedSubtopic = await prisma.subtopic.delete({
      where: { id: subtopicId }
    });

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedSubtopic = {
      id: deletedSubtopic.id,
      title: deletedSubtopic.title,
      description: deletedSubtopic.description,
      slug: deletedSubtopic.slug,
      themeId: deletedSubtopic.themeId,
      themeName: existingSubtopic.theme.title,
      createdAt: deletedSubtopic.createdAt.toISOString(),
      updatedAt: deletedSubtopic.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedSubtopic,
      message: 'Subtopic deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subtopic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subtopic' },
      { status: 500 }
    );
  }
}