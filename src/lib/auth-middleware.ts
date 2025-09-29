import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: number;
  telegramId: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  photoUrl: string | null;
  languageCode: string | null;
  isPremium: boolean | null;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

/**
 * Middleware для проверки аутентификации пользователя
 * Проверяет sessionId в заголовке Authorization
 */
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest) => {
    try {
      // Получаем токен из заголовка Authorization
      const authHeader = req.headers.get('authorization');
      const sessionId = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;

      if (!sessionId) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Ищем пользователя по sessionId
      const user = await prisma.user.findUnique({
        where: { sessionId },
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          lastName: true,
          name: true,
          photoUrl: true,
          languageCode: true,
          isPremium: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid session' },
          { status: 401 }
        );
      }

      // Добавляем пользователя к запросу
      req.user = user;

      // Вызываем оригинальный обработчик
      return await handler(req);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication error' },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  };
}

/**
 * Опциональная аутентификация - не требует обязательной авторизации
 * Если пользователь авторизован, добавляет его данные к запросу
 */
export async function withOptionalAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest) => {
    try {
      // Получаем токен из заголовка Authorization
      const authHeader = req.headers.get('authorization');
      const sessionId = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;

      if (sessionId) {
        // Ищем пользователя по sessionId
        const user = await prisma.user.findUnique({
          where: { sessionId },
          select: {
            id: true,
            telegramId: true,
            username: true,
            firstName: true,
            lastName: true,
            name: true,
            photoUrl: true,
            languageCode: true,
            isPremium: true
          }
        });

        if (user) {
          req.user = user;
        }
      }

      // Вызываем оригинальный обработчик
      return await handler(req);

    } catch (error) {
      console.error('Optional auth middleware error:', error);
      // При ошибке просто продолжаем без пользователя
      return await handler(req);
    } finally {
      await prisma.$disconnect();
    }
  };
}

/**
 * Утилита для получения пользователя из sessionId
 */
export async function getUserFromSession(sessionId: string): Promise<AuthenticatedUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { sessionId },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        name: true,
        photoUrl: true,
        languageCode: true,
        isPremium: true
      }
    });

    return user;
  } catch (error) {
    console.error('Get user from session error:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}