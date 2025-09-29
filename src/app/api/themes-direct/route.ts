import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    
    // Получаем темы
    const themesResult = await client.query(`
      SELECT 
        t.id,
        t.slug,
        t.title,
        t.description,
        t.icon,
        t."createdAt",
        t."updatedAt"
      FROM "Theme" t
      ORDER BY t."createdAt" ASC
    `);

    const themes = [];

    for (const theme of themesResult.rows) {
      // Получаем подтемы для каждой темы
      const subtopicsResult = await client.query(`
        SELECT 
          s.id,
          s.slug,
          s.title,
          s.description,
          s."createdAt",
          s."updatedAt"
        FROM "Subtopic" s
        WHERE s."themeId" = $1
        ORDER BY s."createdAt" ASC
      `, [theme.id]);

      const subtopics = [];

      for (const subtopic of subtopicsResult.rows) {
        // Получаем уроки для каждой подтемы
        const lessonsResult = await client.query(`
          SELECT 
            l.id,
            l.slug,
            l.title,
            l.content,
            l."createdAt",
            l."updatedAt"
          FROM "Lesson" l
          WHERE l."subtopicId" = $1
          ORDER BY l."createdAt" ASC
        `, [subtopic.id]);

        subtopics.push({
          ...subtopic,
          lessons: lessonsResult.rows
        });
      }

      themes.push({
        ...theme,
        subtopics
      });
    }

    return NextResponse.json({
      themes,
      pagination: {
        page: 1,
        limit: themes.length,
        total: themes.length,
        totalPages: 1
      }
    });

  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}