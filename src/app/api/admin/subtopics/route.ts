import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

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
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
  });

  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.description,
        s.slug,
        s."themeId",
        s."createdAt",
        s."updatedAt",
        t.title as "themeName"
      FROM "Subtopic" s
      JOIN "Theme" t ON s."themeId" = t.id
      ORDER BY s."createdAt" ASC
    `);

    // Преобразуем данные в формат, ожидаемый админ-панелью
    const formattedSubtopics = result.rows.map((subtopic) => ({
      id: subtopic.id,
      title: subtopic.title,
      description: subtopic.description,
      slug: subtopic.slug,
      themeId: subtopic.themeId,
      themeName: subtopic.themeName,
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
  } finally {
    await pool.end();
  }
}

// POST - создать новый сабтопик
export async function POST(request: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
  });

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
    const themeResult = await pool.query(
      'SELECT id, title FROM "Theme" WHERE id = $1',
      [parseInt(themeId)]
    );

    if (themeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Проверка на дублирование названия или slug в рамках темы
    const duplicateResult = await pool.query(
      'SELECT id FROM "Subtopic" WHERE "themeId" = $1 AND (title = $2 OR slug = $3)',
      [parseInt(themeId), title.trim(), slug]
    );

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Subtopic with this title already exists in this theme' },
        { status: 409 }
      );
    }

    // Создание нового сабтопика в базе данных
    const insertResult = await pool.query(
      `INSERT INTO "Subtopic" (title, description, slug, "themeId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, title, description, slug, "themeId", "createdAt", "updatedAt"`,
      [title.trim(), description.trim(), slug, parseInt(themeId)]
    );

    const newSubtopic = insertResult.rows[0];

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedSubtopic = {
      id: newSubtopic.id,
      title: newSubtopic.title,
      description: newSubtopic.description,
      slug: newSubtopic.slug,
      themeId: newSubtopic.themeId,
      themeName: themeResult.rows[0].title,
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
  } finally {
    await pool.end();
  }
}

// PUT - обновить сабтопик
export async function PUT(request: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
  });

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
    const subtopicResult = await pool.query(
      'SELECT id FROM "Subtopic" WHERE id = $1',
      [parseInt(id)]
    );

    if (subtopicResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Subtopic not found' },
        { status: 404 }
      );
    }

    // Проверка существования темы
    const themeResult = await pool.query(
      'SELECT id, title FROM "Theme" WHERE id = $1',
      [parseInt(themeId)]
    );

    if (themeResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    // Проверка на дублирование названия или slug в рамках темы (исключая текущий сабтопик)
    const duplicateResult = await pool.query(
      'SELECT id FROM "Subtopic" WHERE id != $1 AND "themeId" = $2 AND (title = $3 OR slug = $4)',
      [parseInt(id), parseInt(themeId), title.trim(), slug]
    );

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Subtopic with this title already exists in this theme' },
        { status: 409 }
      );
    }

    // Обновление сабтопика в базе данных
    const updateResult = await pool.query(
      `UPDATE "Subtopic" 
       SET title = $1, description = $2, slug = $3, "themeId" = $4, "updatedAt" = NOW()
       WHERE id = $5
       RETURNING id, title, description, slug, "themeId", "createdAt", "updatedAt"`,
      [title.trim(), description.trim(), slug, parseInt(themeId), parseInt(id)]
    );

    const updatedSubtopic = updateResult.rows[0];

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedSubtopic = {
      id: updatedSubtopic.id,
      title: updatedSubtopic.title,
      description: updatedSubtopic.description,
      slug: updatedSubtopic.slug,
      themeId: updatedSubtopic.themeId,
      themeName: themeResult.rows[0].title,
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
  } finally {
    await pool.end();
  }
}

// DELETE - удалить сабтопик
export async function DELETE(request: NextRequest) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
  });

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

    // Проверка существования сабтопика и получение данных темы
    const existingResult = await pool.query(
      `SELECT s.id, s.title, s.description, s.slug, s."themeId", s."createdAt", s."updatedAt", t.title as "themeName"
       FROM "Subtopic" s
       JOIN "Theme" t ON s."themeId" = t.id
       WHERE s.id = $1`,
      [subtopicId]
    );
    
    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Subtopic not found' },
        { status: 404 }
      );
    }

    const existingSubtopic = existingResult.rows[0];

    // Удаление сабтопика из базы данных
    await pool.query(
      'DELETE FROM "Subtopic" WHERE id = $1',
      [subtopicId]
    );

    // Возвращаем в формате, ожидаемом админ-панелью
    const formattedSubtopic = {
      id: existingSubtopic.id,
      title: existingSubtopic.title,
      description: existingSubtopic.description,
      slug: existingSubtopic.slug,
      themeId: existingSubtopic.themeId,
      themeName: existingSubtopic.themeName,
      createdAt: existingSubtopic.createdAt.toISOString(),
      updatedAt: existingSubtopic.updatedAt.toISOString()
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
  } finally {
    await pool.end();
  }
}