import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Находим тему по slug'у
    const theme = await prisma.theme.findUnique({
      where: { slug },
      include: {
        subtopics: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!theme) {
      return NextResponse.json(
        { error: `Theme with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    // Получаем параметры пагинации из query string
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';

    // Применяем пагинацию
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubtopics = theme.subtopics.slice(startIndex, endIndex);

    // Форматируем ответ
    const response = {
      subtopics: paginatedSubtopics.map(subtopic => ({
        id: subtopic.id,
        title: subtopic.title,
        slug: subtopic.slug,
        description: subtopic.description,
        themeId: subtopic.themeId,
        createdAt: subtopic.createdAt,
        updatedAt: subtopic.updatedAt
      })),
      theme: {
        id: theme.id,
        title: theme.title,
        slug: theme.slug,
        description: theme.description,
        icon: theme.icon,
        createdAt: theme.createdAt,
        updatedAt: theme.updatedAt
      },
      pagination: {
        page,
        limit,
        total: theme.subtopics.length,
        totalPages: Math.ceil(theme.subtopics.length / limit)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching subtopics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}