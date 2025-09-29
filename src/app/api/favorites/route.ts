import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateLessonId, getUserFromRequest } from '@/lib/user-utils';

// API route for managing user favorites

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userFavorites = await prisma.userFavoriteLesson.findMany({
      where: { userId: user.id },
    });

    const favoriteIds = userFavorites.map((f) => f.lessonId.toString());

    return NextResponse.json({ 
      success: true, 
      favorites: favoriteIds 
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const lesson = await prisma.lesson.findUnique({
      where: { id: validatedLessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    await prisma.userFavoriteLesson.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: validatedLessonId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        lessonId: validatedLessonId,
      },
    });

    const userFavorites = await prisma.userFavoriteLesson.findMany({
      where: { userId: user.id },
    });

    const favoriteIds = userFavorites.map((f) => f.lessonId.toString());

    return NextResponse.json({ 
      success: true, 
      favorites: favoriteIds 
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    await prisma.userFavoriteLesson.delete({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: validatedLessonId,
        },
      },
    });

    const userFavorites = await prisma.userFavoriteLesson.findMany({
      where: { userId: user.id },
    });

    const favoriteIds = userFavorites.map((f) => f.lessonId.toString());

    return NextResponse.json({ 
      success: true, 
      favorites: favoriteIds 
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}