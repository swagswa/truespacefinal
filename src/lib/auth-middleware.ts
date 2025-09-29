import { NextRequest, NextResponse } from 'next/server';
import { getPool } from './db';

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
 * Проверяет telegramId в заголовке Authorization
 */
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest) => {
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      // Получаем токен из заголовка Authorization
      const authHeader = req.headers.get('authorization');
      const telegramId = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;

      if (!telegramId) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Ищем пользователя по telegramId
      const userResult = await client.query(`
        SELECT 
          id, 
          "telegramId", 
          username, 
          "firstName", 
          "lastName", 
          name, 
          "photoUrl", 
          "languageCode", 
          "isPremium"
        FROM users 
        WHERE "telegramId" = $1
      `, [telegramId]);

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid session' },
          { status: 401 }
        );
      }

      const user = userResult.rows[0];

      // Добавляем пользователя к запросу
      req.user = {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        photoUrl: user.photoUrl,
        languageCode: user.languageCode,
        isPremium: user.isPremium
      };

      // Вызываем оригинальный обработчик
      return await handler(req);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication error' },
        { status: 500 }
      );
    } finally {
      client.release();
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
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      // Получаем токен из заголовка Authorization
      const authHeader = req.headers.get('authorization');
      const telegramId = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;

      if (telegramId) {
        // Ищем пользователя по telegramId
        const userResult = await client.query(`
          SELECT 
            id, 
            "telegramId", 
            username, 
            "firstName", 
            "lastName", 
            name, 
            "photoUrl", 
            "languageCode", 
            "isPremium"
          FROM users 
          WHERE "telegramId" = $1
        `, [telegramId]);

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          req.user = {
            id: user.id,
            telegramId: user.telegramId,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name,
            photoUrl: user.photoUrl,
            languageCode: user.languageCode,
            isPremium: user.isPremium
          };
        }
      }

      // Вызываем оригинальный обработчик
      return await handler(req);

    } catch (error) {
      console.error('Optional auth middleware error:', error);
      // При ошибке просто продолжаем без пользователя
      return await handler(req);
    } finally {
      client.release();
    }
  };
}

/**
 * Утилита для получения пользователя из telegramId
 */
export async function getUserFromTelegramId(telegramId: string): Promise<AuthenticatedUser | null> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const userResult = await client.query(`
      SELECT 
        id, 
        "telegramId", 
        username, 
        "firstName", 
        "lastName", 
        name, 
        "photoUrl", 
        "languageCode", 
        "isPremium"
      FROM users 
      WHERE "telegramId" = $1
    `, [telegramId]);

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];
    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      photoUrl: user.photoUrl,
      languageCode: user.languageCode,
      isPremium: user.isPremium
    };
  } catch (error) {
    console.error('Get user from session error:', error);
    return null;
  } finally {
    client.release();
  }
}