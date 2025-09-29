import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/user-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCompletions = await prisma.userLessonCompletion.findMany({
      where: { userId: user.id },
      include: {
        lesson: {
          include: {
            subtopic: {
              include: {
                theme: true
              }
            }
          }
        }
      }
    });

    const completedLessons = userCompletions.map((completion) => ({
      id: completion.lesson.id,
      title: completion.lesson.title,
      description: completion.lesson.description,
      duration: completion.lesson.duration,
      subtopic: completion.lesson.subtopic,
      theme: completion.lesson.subtopic.theme,
      completedAt: completion.completedAt
    }));

    return NextResponse.json({
      lessons: completedLessons,
      count: completedLessons.length
    });
  } catch (error) {
    console.error('Error fetching completed lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completed lessons' },
      { status: 500 }
    );
  }
}