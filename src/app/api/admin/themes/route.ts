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



// GET - получить все темы
export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Преобразуем данные в формат, ожидаемый админ-панелью
    const formattedThemes = themes.map((theme) => ({
      id: theme.id,
      name: theme.title, // В базе поле называется title, в админке - name
      description: theme.description,
      icon: theme.icon,
      slug: theme.slug,
      createdAt: theme.createdAt.toISOString(),
      updatedAt: theme.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedThemes
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

// POST - создать новую тему
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon } = body;

    // Валидация
    if (!name || !description || !icon) {
      return NextResponse.json(
        { success: false, error: 'Name, description, and icon are required' },
        { status: 400 }
      );
    }

    const slug = createSlug(name);

    // Проверка на дублирование названия или slug
    const existingTheme = await prisma.theme.findFirst({
      where: {
        OR: [
          { title: name.trim() },
          { slug: slug }
        ]
      }
    });

    if (existingTheme) {
      return NextResponse.json(
        { success: false, error: 'Theme with this name already exists' },
        { status: 409 }
      );
    }

    // Создание новой темы в базе данных
    const newTheme = await prisma.theme.create({
      data: {
        title: name.trim(),
        description: description.trim(),
        icon,
        slug
      }
    });

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedTheme = {
      id: newTheme.id,
      name: newTheme.title,
      description: newTheme.description,
      icon: newTheme.icon,
      slug: newTheme.slug,
      createdAt: newTheme.createdAt.toISOString(),
      updatedAt: newTheme.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedTheme
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create theme' },
      { status: 500 }
    );
  }
}

// PUT - обновить тему
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, icon } = body;

    // Валидация
    if (!id || !name || !description || !icon) {
      return NextResponse.json(
        { success: false, error: 'ID, name, description, and icon are required' },
        { status: 400 }
      );
    }

    const slug = createSlug(name);

    // Проверка существования темы
    const existingTheme = await prisma.theme.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTheme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Проверка на дублирование названия или slug (исключая текущую тему)
    const duplicateTheme = await prisma.theme.findFirst({
      where: {
        AND: [
          { id: { not: parseInt(id) } },
          {
            OR: [
              { title: name.trim() },
              { slug: slug }
            ]
          }
        ]
      }
    });

    if (duplicateTheme) {
      return NextResponse.json(
        { success: false, error: 'Theme with this name already exists' },
        { status: 409 }
      );
    }

    // Обновление темы в базе данных
    const updatedTheme = await prisma.theme.update({
      where: { id: parseInt(id) },
      data: {
        title: name.trim(),
        description: description.trim(),
        icon,
        slug
      }
    });

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedTheme = {
      id: updatedTheme.id,
      name: updatedTheme.title,
      description: updatedTheme.description,
      icon: updatedTheme.icon,
      slug: updatedTheme.slug,
      createdAt: updatedTheme.createdAt.toISOString(),
      updatedAt: updatedTheme.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedTheme
    });

  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}

// DELETE - удалить тему
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    const themeId = parseInt(id);

    // Проверка существования темы
    const existingTheme = await prisma.theme.findUnique({
      where: { id: themeId }
    });
    
    if (!existingTheme) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Удаление темы из базы данных
    const deletedTheme = await prisma.theme.delete({
      where: { id: themeId }
    });

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedTheme = {
      id: deletedTheme.id,
      name: deletedTheme.title,
      description: deletedTheme.description,
      icon: deletedTheme.icon,
      slug: deletedTheme.slug,
      createdAt: deletedTheme.createdAt.toISOString(),
      updatedAt: deletedTheme.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedTheme,
      message: 'Theme deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting theme:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete theme' },
      { status: 500 }
    );
  }
}