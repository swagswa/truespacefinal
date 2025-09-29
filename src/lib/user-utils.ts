import { pool } from '@/lib/db';
import { NextRequest } from 'next/server';

/**
 * Получает sessionId из заголовков запроса
 * @param request - NextRequest объект
 * @returns sessionId или 'anonymous' по умолчанию
 */
export function getSessionId(request: NextRequest): string {
  return request.headers.get('x-session-id') || 'anonymous';
}

/**
 * Получает или создает пользователя по sessionId
 * @param sessionId - идентификатор сессии
 * @returns объект пользователя
 */
export async function getOrCreateUser(sessionId: string) {
  const client = await pool.connect();
  
  try {
    // Сначала пытаемся найти пользователя
    const existingUserResult = await client.query(
      'SELECT id, "sessionId", "createdAt", "updatedAt" FROM users WHERE "sessionId" = $1',
      [sessionId]
    );

    if (existingUserResult.rows.length > 0) {
      return existingUserResult.rows[0];
    }

    // Если пользователь не найден, создаем нового
    const newUserResult = await client.query(
      'INSERT INTO users ("sessionId", "createdAt", "updatedAt") VALUES ($1, NOW(), NOW()) RETURNING id, "sessionId", "createdAt", "updatedAt"',
      [sessionId]
    );

    return newUserResult.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Получает пользователя из запроса
 * @param request - NextRequest объект
 * @returns объект пользователя
 */
export async function getUserFromRequest(request: NextRequest) {
  const sessionId = getSessionId(request);
  return await getOrCreateUser(sessionId);
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