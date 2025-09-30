import { getPool } from '@/lib/db';
import { NextRequest } from 'next/server';

/**
 * Получает telegramId из заголовков запроса
 * @param request - NextRequest объект
 * @returns telegramId или null
 */
export function getTelegramId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const telegramId = authHeader.substring(7);
    return telegramId;
  }
  return null;
}

/**
 * Получает пользователя по telegramId
 * @param telegramId - идентификатор Telegram
 * @returns объект пользователя или null
 */
export async function getUserByTelegramId(telegramId: string) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, "telegramId", username, "firstName", "lastName", name, "photoUrl", "languageCode", "isPremium", "createdAt", "updatedAt" FROM users WHERE "telegramId" = $1',
      [telegramId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
}

/**
 * Получает пользователя из запроса
 * @param request - NextRequest объект
 * @returns объект пользователя или null
 */
export async function getUserFromRequest(request: NextRequest) {
  const telegramId = getTelegramId(request);
  if (!telegramId) {
    return null;
  }
  return await getUserByTelegramId(telegramId);
}

/**
 * Валидирует и конвертирует lessonId в число
 * @param lessonId - ID урока (может быть строкой или числом)
 * @returns число или null если невалидный
 */
export function validateLessonId(lessonId: unknown): number | null {
  if (!lessonId) return null;
  
  const lessonIdNum = parseInt(String(lessonId), 10);
  return isNaN(lessonIdNum) ? null : lessonIdNum;
}