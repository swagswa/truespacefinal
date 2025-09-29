import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getUserFromRequest } from '@/lib/user-utils';

export async function GET(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCompletionsResult = await client.query(`
      SELECT 
        l.id,
        l.title,
        l.content,
        l.slug as lesson_slug,
        s.id as subtopic_id,
        s.title as subtopic_title,
        s.slug as subtopic_slug,
        t.id as theme_id,
        t.title as theme_title,
        t.slug as theme_slug,
        t.icon as theme_icon,
        ulc."completedAt"
      FROM "UserLessonCompletion" ulc
      JOIN "Lesson" l ON ulc."lessonId" = l.id
      JOIN "Subtopic" s ON l."subtopicId" = s.id
      JOIN "Theme" t ON s."themeId" = t.id
      WHERE ulc."userId" = $1
      ORDER BY ulc."completedAt" DESC
    `, [user.id]);

    const completedLessons = userCompletionsResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      slug: row.lesson_slug,
      subtopic: {
        id: row.subtopic_id,
        title: row.subtopic_title,
        slug: row.subtopic_slug
      },
      theme: {
        id: row.theme_id,
        title: row.theme_title,
        slug: row.theme_slug,
        icon: row.theme_icon
      },
      completedAt: row.completedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      lessons: completedLessons,
      count: completedLessons.length
    });
  } catch (error) {
    console.error('Error fetching completed lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completed lessons' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}