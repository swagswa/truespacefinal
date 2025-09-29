import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Создает стандартизированный ответ об ошибке
 * @param error - объект ошибки или строка
 * @param status - HTTP статус код
 * @param code - опциональный код ошибки
 * @returns NextResponse с ошибкой
 */
export function createErrorResponse(
  error: string | Error | unknown,
  status: number = 500,
  code?: string
): NextResponse {
  let message: string;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Unknown error occurred';
  }

  console.error(`API Error [${status}]:`, message, error);

  const errorResponse: { error: string; code?: string } = { error: message };
  if (code) {
    errorResponse.code = code;
  }

  return NextResponse.json(errorResponse, { status });
}

/**
 * Обрабатывает ошибки валидации
 * @param message - сообщение об ошибке
 * @returns NextResponse с ошибкой валидации
 */
export function createValidationError(message: string): NextResponse {
  return createErrorResponse(message, 400, 'VALIDATION_ERROR');
}

/**
 * Обрабатывает ошибки "не найдено"
 * @param resource - название ресурса
 * @returns NextResponse с ошибкой 404
 */
export function createNotFoundError(resource: string): NextResponse {
  return createErrorResponse(`${resource} not found`, 404, 'NOT_FOUND');
}

/**
 * Обрабатывает внутренние ошибки сервера
 * @param error - объект ошибки
 * @returns NextResponse с ошибкой 500
 */
export function createInternalError(error: unknown): NextResponse {
  return createErrorResponse(error, 500, 'INTERNAL_ERROR');
}

/**
 * Создает успешный ответ
 * @param data - данные для ответа
 * @param status - HTTP статус код (по умолчанию 200)
 * @returns NextResponse с данными
 */
export function createSuccessResponse(data: Record<string, unknown>, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}