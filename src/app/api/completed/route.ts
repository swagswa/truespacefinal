import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { validateLessonId, getUserFromRequest } from '@/lib/user-utils';

export async function GET(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCompletionsResult = await client.query(`
      SELECT "lessonId", "completedAt"
      FROM "UserLessonCompletion" 
      WHERE "userId" = $1
    `, [user.id]);

    const completed = userCompletionsResult.rows.map(row => ({
      lessonId: row.lessonId.toString(),
      completedAt: row.completedAt.toISOString()
    }));

    return NextResponse.json({ 
      success: true, 
      completed
    });
  } catch (error) {
    console.error('Failed to fetch completed lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completed lessons' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const { lessonId } = await request.json();
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validatedLessonId = validateLessonId(lessonId);
    if (!validatedLessonId) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    // Check if lesson exists
    const lessonResult = await client.query(`
      SELECT id FROM "Lesson" WHERE id = $1
    `, [validatedLessonId]);

    if (lessonResult.rows.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Mark lesson as completed using UPSERT (INSERT ... ON CONFLICT)
    await client.query(`
      INSERT INTO "UserLessonCompletion" ("userId", "lessonId", "completedAt")
      VALUES ($1, $2, NOW())
      ON CONFLICT ("userId", "lessonId") 
      DO UPDATE SET "completedAt" = NOW()
    `, [user.id, validatedLessonId]);

    // Return updated list of completed lessons
    const userCompletionsResult = await client.query(`
      SELECT "lessonId", "completedAt"
      FROM "UserLessonCompletion" 
      WHERE "userId" = $1
    `, [user.id]);

    const completed = userCompletionsResult.rows.map(row => ({
      lessonId: row.lessonId.toString(),
      completedAt: row.completedAt.toISOString()
    }));

    return NextResponse.json({ 
      success: true, 
      completed
    });
  } catch (error) {
    console.error('Failed to mark lesson as completed:', error);
    return NextResponse.json(
      { error: 'Failed to mark lesson as completed' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const { lessonId } = await request.json();
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validatedLessonId = validateLessonId(lessonId);
    if (!validatedLessonId) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    // Remove lesson completion
    await client.query(`
      DELETE FROM "UserLessonCompletion" 
      WHERE "userId" = $1 AND "lessonId" = $2
    `, [user.id, validatedLessonId]);

    // Return updated list of completed lessons
    const userCompletionsResult = await client.query(`
      SELECT "lessonId", "completedAt"
      FROM "UserLessonCompletion" 
      WHERE "userId" = $1
    `, [user.id]);

    const completed = userCompletionsResult.rows.map(row => ({
      lessonId: row.lessonId.toString(),
      completedAt: row.completedAt.toISOString()
    }));

    return NextResponse.json({ 
      success: true, 
      completed
    });
  } catch (error) {
    console.error('Failed to remove lesson completion:', error);
    return NextResponse.json(
      { error: 'Failed to remove lesson completion' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}