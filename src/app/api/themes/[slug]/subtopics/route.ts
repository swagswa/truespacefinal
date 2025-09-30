import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Создаем пул соединений с базой данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const client = await pool.connect();
  try {
    const { slug } = await params;
    
    // Находим тему по slug'у
    const themeResult = await client.query(`
      SELECT id, title, slug, description, icon, "createdAt", "updatedAt"
      FROM "Theme"
      WHERE slug = $1
    `, [slug]);

    if (themeResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          data: { error: `Theme with slug "${slug}" not found` }
        },
        { status: 404 }
      );
    }

    const theme = themeResult.rows[0];

    // Получаем параметры пагинации из query string
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';

    // Получаем subtopics для этой темы с пагинацией
    const offset = (page - 1) * limit;
    const subtopicsResult = await client.query(`
      SELECT id, title, slug, description, "themeId", "createdAt", "updatedAt"
      FROM "Subtopic"
      WHERE "themeId" = $1
      ORDER BY "${sortBy}" ${sortOrder.toUpperCase()}
      LIMIT $2 OFFSET $3
    `, [theme.id, limit, offset]);

    // Получаем общее количество subtopics для пагинации
    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM "Subtopic"
      WHERE "themeId" = $1
    `, [theme.id]);

    const total = parseInt(countResult.rows[0].total);

    // Форматируем ответ
    const response = {
      success: true,
      data: {
        subtopics: subtopicsResult.rows.map(subtopic => ({
          id: subtopic.id,
          title: subtopic.title,
          slug: subtopic.slug,
          description: subtopic.description,
          themeId: subtopic.themeId,
          createdAt: subtopic.createdAt,
          updatedAt: subtopic.updatedAt
        })),
        theme: {
          id: theme.id,
          title: theme.title,
          slug: theme.slug,
          description: theme.description,
          icon: theme.icon,
          createdAt: theme.createdAt,
          updatedAt: theme.updatedAt
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching subtopics:', error);
    return NextResponse.json(
      { 
        success: false,
        data: { error: 'Internal server error' }
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}