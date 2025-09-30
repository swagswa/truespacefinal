import { NextRequest } from 'next/server';
import { Pool } from 'pg';
import { 
  createNotFoundError,
  createSuccessResponse,
  createInternalError 
} from '@/lib/api-error-handler';

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

    // Найти подтему по slug
    const subtopicResult = await client.query(`
      SELECT s.id, s.title, s.description, s.slug, s."themeId", s."createdAt", s."updatedAt",
             t.id as theme_id, t.title as theme_title, t.slug as theme_slug, 
             t.description as theme_description, t.icon as theme_icon,
             t."createdAt" as theme_created_at, t."updatedAt" as theme_updated_at
      FROM "Subtopic" s
      LEFT JOIN "Theme" t ON s."themeId" = t.id
      WHERE s.slug = $1
    `, [slug]);

    if (subtopicResult.rows.length === 0) {
      return createNotFoundError('Subtopic not found');
    }

    const subtopicData = subtopicResult.rows[0];

    // Получить уроки для этой подтемы
    const lessonsResult = await client.query(`
      SELECT id, slug, title, content, "subtopicId", "createdAt", "updatedAt"
      FROM "Lesson"
      WHERE "subtopicId" = $1
      ORDER BY "createdAt" ASC
    `, [subtopicData.id]);

    // Преобразуем данные в нужный формат
    const formattedLessons = lessonsResult.rows.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      description: '', // Поле description отсутствует в таблице
      duration: 30, // Поле duration отсутствует в таблице, используем значение по умолчанию
      difficulty: 'Начальный', // Можно добавить в схему позже
      videoUrl: `/videos/${lesson.id}.mp4`,
      subtopicSlug: slug,
      content: lesson.content,
      subtopicId: lesson.subtopicId,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    }));

    const formattedSubtopic = {
      id: subtopicData.id,
      title: subtopicData.title,
      description: subtopicData.description,
      slug: subtopicData.slug,
      themeId: subtopicData.themeId,
      theme: {
        id: subtopicData.theme_id,
        title: subtopicData.theme_title,
        slug: subtopicData.theme_slug,
        description: subtopicData.theme_description,
        icon: subtopicData.theme_icon,
        createdAt: subtopicData.theme_created_at,
        updatedAt: subtopicData.theme_updated_at
      },
      createdAt: subtopicData.createdAt,
      updatedAt: subtopicData.updatedAt
    };

    return createSuccessResponse({
      lessons: formattedLessons,
      subtopic: formattedSubtopic,
      total: formattedLessons.length,
      page: 1,
      limit: 50
    });

  } catch (error) {
    return createInternalError(error);
  } finally {
    client.release();
  }
}