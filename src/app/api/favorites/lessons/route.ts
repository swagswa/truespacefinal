import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/user-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userFavorites = await prisma.userFavoriteLesson.findMany({
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

    const favoriteLessons = userFavorites.map((favorite) => ({
      id: favorite.lesson.id,
      title: favorite.lesson.title,
      description: favorite.lesson.description,
      duration: favorite.lesson.duration,
      subtopic: favorite.lesson.subtopic,
      theme: favorite.lesson.subtopic.theme,
      favoriteDate: favorite.createdAt
    }));

    return NextResponse.json({
      lessons: favoriteLessons,
      count: favoriteLessons.length
    });
  } catch (error) {
    console.error('Error fetching favorite lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite lessons' },
      { status: 500 }
    );
  }
}