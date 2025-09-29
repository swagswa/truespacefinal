import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  createNotFoundError,
  createSuccessResponse,
  createInternalError 
} from '@/lib/api-error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Найти подтему по slug
    const subtopic = await prisma.subtopic.findFirst({
      where: {
        slug: slug
      },
      include: {
        lessons: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        theme: true
      }
    });

    if (!subtopic) {
      return createNotFoundError('Subtopic not found');
    }

    // Преобразуем данные в нужный формат
    const formattedLessons = subtopic.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      duration: lesson.duration || 30,
      difficulty: 'Начальный', // Можно добавить в схему позже
      videoUrl: `/videos/${lesson.id}.mp4`,
      subtopicSlug: slug,
      content: lesson.content,
      subtopicId: lesson.subtopicId,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    }));

    const formattedSubtopic = {
      id: subtopic.id,
      title: subtopic.title,
      description: subtopic.description,
      slug: subtopic.slug,
      themeId: subtopic.themeId,
      theme: subtopic.theme,
      createdAt: subtopic.createdAt,
      updatedAt: subtopic.updatedAt
    };

    return createSuccessResponse({
      lessons: formattedLessons,
      subtopic: formattedSubtopic,
      total: formattedLessons.length,
      page: 1,
      limit: 50
    });

  } catch (error) {
    return createInternalError(error);
  }
}