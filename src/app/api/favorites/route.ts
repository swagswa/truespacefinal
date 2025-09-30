import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { validateLessonId, getUserFromRequest } from '@/lib/user-utils';

// API route for managing user favorites

export async function GET(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await client.query(`
      SELECT "lessonId" 
      FROM user_favorite_lessons 
      WHERE "userId" = $1
    `, [user.id]);

    const favoriteIds = result.rows.map((row) => row.lessonId.toString());

    return NextResponse.json({ 
      success: true, 
      favorites: favoriteIds 
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
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

    // Upsert favorite (insert if not exists, do nothing if exists)
    await client.query(`
      INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
      VALUES ($1, $2, NOW())
      ON CONFLICT ("userId", "lessonId") DO NOTHING
    `, [user.id, validatedLessonId]);

    // Get updated favorites list
    const favoritesResult = await client.query(`
      SELECT "lessonId" 
      FROM user_favorite_lessons 
      WHERE "userId" = $1
    `, [user.id]);

    const favoriteIds = favoritesResult.rows.map((row) => row.lessonId.toString());

    return NextResponse.json({ 
      success: true, 
      favorites: favoriteIds 
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
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

    // Delete favorite
    await client.query(`
      DELETE FROM user_favorite_lessons 
      WHERE "userId" = $1 AND "lessonId" = $2
    `, [user.id, validatedLessonId]);

    // Get updated favorites list
    const favoritesResult = await client.query(`
      SELECT "lessonId" 
      FROM user_favorite_lessons 
      WHERE "userId" = $1
    `, [user.id]);

    const favoriteIds = favoritesResult.rows.map((row) => row.lessonId.toString());

    return NextResponse.json({ 
      success: true, 
      favorites: favoriteIds 
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}