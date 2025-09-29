import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateLessonId, getUserFromRequest } from '@/lib/user-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCompletions = await prisma.userLessonCompletion.findMany({
      where: { userId: user.id },
    });

    const completedIds = userCompletions.map((c: { lessonId: number }) => c.lessonId.toString());

    return NextResponse.json({ 
      success: true, 
      completed: completedIds.map((id: string) => ({ lessonId: id, completedAt: new Date().toISOString() }))
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch completed lessons' },
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

    // Mark lesson as completed
    await prisma.userLessonCompletion.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: validatedLessonId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        lessonId: validatedLessonId,
        completedAt: new Date(),
      },
    });

    // Return updated list of completed lesson IDs
    const userCompletions = await prisma.userLessonCompletion.findMany({
      where: { userId: user.id },
    });

    const completedIds = userCompletions.map((c: { lessonId: number }) => c.lessonId.toString());

    return NextResponse.json({ 
      success: true, 
      completed: completedIds.map((id: string) => ({ lessonId: id, completedAt: new Date().toISOString() }))
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to mark lesson as completed' },
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

    // Remove lesson completion
    await prisma.userLessonCompletion.delete({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: validatedLessonId,
        },
      },
    });

    // Return updated list of completed lesson IDs
    const userCompletions = await prisma.userLessonCompletion.findMany({
      where: { userId: user.id },
    });

    const completedIds = userCompletions.map((c: { lessonId: number }) => c.lessonId.toString());

    return NextResponse.json({ 
      success: true, 
      completed: completedIds.map((id: string) => ({ lessonId: id, completedAt: new Date().toISOString() }))
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to remove lesson completion' },
      { status: 500 }
    );
  }
}