import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Получаем все темы с подтемами и уроками
    const themes = await prisma.theme.findMany({
      include: {
        subtopics: {
          include: {
            lessons: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Преобразуем данные в нужный формат
    const formattedThemes = themes.map((theme) => ({
      id: theme.id,
      title: theme.title,
      slug: theme.slug,
      description: theme.description,
      icon: theme.icon,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
      subtopics: theme.subtopics.map((subtopic) => ({
        id: subtopic.id,
        title: subtopic.title,
        slug: subtopic.slug,
        description: subtopic.description,
        themeId: subtopic.themeId,
        createdAt: subtopic.createdAt,
        updatedAt: subtopic.updatedAt,
        lessons: subtopic.lessons
      }))
    }));

    return NextResponse.json({
      themes: formattedThemes,
      pagination: {
        page: 1,
        limit: formattedThemes.length,
        total: formattedThemes.length,
        totalPages: 1
      }
    });

  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch themes',
        themes: [],
        pagination: {
          page: 1,
          limit: 0,
          total: 0,
          totalPages: 0
        }
      }, 
      { status: 500 }
    );
  }
}