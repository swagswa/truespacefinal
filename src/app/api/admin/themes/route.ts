import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Создаем пул соединений с базой данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, title, description, icon, slug, "createdAt", "updatedAt"
      FROM "Theme"
      ORDER BY "createdAt" ASC
    `);

    // Преобразуем данные в формат, ожидаемый админ-панелью
    const formattedThemes = result.rows.map((theme) => ({
      id: theme.id,
      name: theme.title,
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
  } finally {
    client.release();
  }
}

// POST - создать новую тему
export async function POST(request: NextRequest) {
  const client = await pool.connect();
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
    const existingResult = await client.query(`
      SELECT id FROM "Theme"
      WHERE title = $1 OR slug = $2
    `, [name.trim(), slug]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Theme with this name already exists' },
        { status: 409 }
      );
    }

    // Создание новой темы в базе данных
    const result = await client.query(`
      INSERT INTO "Theme" (title, description, icon, slug, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, title, description, icon, slug, "createdAt", "updatedAt"
    `, [name.trim(), description.trim(), icon, slug]);

    const newTheme = result.rows[0];

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
  } finally {
    client.release();
  }
}

// PUT - обновить тему
export async function PUT(request: NextRequest) {
  const client = await pool.connect();
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
    const themeId = parseInt(id);

    // Проверка существования темы
    const existingResult = await client.query(`
      SELECT id FROM "Theme" WHERE id = $1
    `, [themeId]);

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Проверка на дублирование названия или slug (исключая текущую тему)
    const duplicateResult = await client.query(`
      SELECT id FROM "Theme"
      WHERE id != $1 AND (title = $2 OR slug = $3)
    `, [themeId, name.trim(), slug]);

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Theme with this name already exists' },
        { status: 409 }
      );
    }

    // Обновление темы в базе данных
    const result = await client.query(`
      UPDATE "Theme"
      SET title = $1, description = $2, icon = $3, slug = $4, "updatedAt" = NOW()
      WHERE id = $5
      RETURNING id, title, description, icon, slug, "createdAt", "updatedAt"
    `, [name.trim(), description.trim(), icon, slug, themeId]);

    const updatedTheme = result.rows[0];

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
  } finally {
    client.release();
  }
}

// DELETE - удалить тему
export async function DELETE(request: NextRequest) {
  const client = await pool.connect();
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

    // Проверка существования темы и получение данных перед удалением
    const existingResult = await client.query(`
      SELECT id, title, description, icon, slug, "createdAt", "updatedAt"
      FROM "Theme" WHERE id = $1
    `, [themeId]);
    
    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    const existingTheme = existingResult.rows[0];

    // Удаление темы из базы данных
    await client.query(`
      DELETE FROM "Theme" WHERE id = $1
    `, [themeId]);

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedTheme = {
      id: existingTheme.id,
      name: existingTheme.title,
      description: existingTheme.description,
      icon: existingTheme.icon,
      slug: existingTheme.slug,
      createdAt: existingTheme.createdAt.toISOString(),
      updatedAt: existingTheme.updatedAt.toISOString()
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
  } finally {
    client.release();
  }
}