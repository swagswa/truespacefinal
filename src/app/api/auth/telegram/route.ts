import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool } from '@/lib/db';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

// Функция для валидации Telegram initData
function validateTelegramInitData(initData: string, botToken: string): TelegramUser {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // Создаем строку для проверки подписи
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Создаем подпись
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Проверяем подпись
    if (signature !== hash) {
      throw new Error('Invalid signature');
    }

    // Проверяем время (данные должны быть не старше 24 часов)
    const authDate = parseInt(urlParams.get('auth_date') || '0');
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) { // 24 часа
      throw new Error('Data is too old');
    }

    // Парсим данные пользователя
    const userDataString = urlParams.get('user');
    if (!userDataString) {
      throw new Error('No user data');
    }

    return JSON.parse(userDataString);
  } catch (error) {
    throw new Error(`Validation failed: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Telegram auth POST request received');
    
    // Проверяем Content-Type заголовок
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid Content-Type. Expected application/json, got:', contentType);
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // Проверяем размер тела запроса
    const contentLength = request.headers.get('content-length');
    console.log('Content-Length:', contentLength);
    
    if (!contentLength || parseInt(contentLength) === 0) {
      console.error('Empty request body detected');
      return NextResponse.json(
        { success: false, error: 'Request body cannot be empty' },
        { status: 400 }
      );
    }
    
    // Безопасно парсим JSON с обработкой ошибок
    let requestBody;
    try {
      const text = await request.text();
      console.log('Request text length:', text.length);
      
      if (!text.trim()) {
        console.error('Request body is empty or contains only whitespace');
        return NextResponse.json(
          { success: false, error: 'Request body cannot be empty' },
          { status: 400 }
        );
      }
      
      requestBody = JSON.parse(text);
      console.log('Request body parsed successfully');
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      console.error('Error details:', {
        name: jsonError instanceof Error ? jsonError.name : 'Unknown',
        message: jsonError instanceof Error ? jsonError.message : 'Unknown error'
      });
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { initData } = requestBody || {};
    console.log('InitData received:', initData ? 'Yes (length: ' + initData.length + ')' : 'No');

    if (!initData) {
      console.log('InitData is missing or empty');
      return NextResponse.json(
        { success: false, error: 'initData is required' },
        { status: 400 }
      );
    }

    // Получаем токен бота из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { success: false, error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    // Валидируем initData
    let userData;
    try {
      userData = validateTelegramInitData(initData, botToken);
    } catch (_error) {
      return NextResponse.json(
        { success: false, error: 'Invalid initData' },
        { status: 401 }
      );
    }

    // Используем upsert для создания или обновления пользователя
    const pool = getPool();
    const client = await pool.connect();
    let user;
    try {
      const telegramId = userData.id.toString();
      const username = userData.username || null;
      const firstName = userData.first_name || null;
      const lastName = userData.last_name || null;
      const photoUrl = userData.photo_url || null;
      const languageCode = userData.language_code || null;
      const isPremium = userData.is_premium || false;
      const name = userData.first_name || userData.username || 'Telegram User';

      console.log('Creating/updating user with telegramId:', telegramId);
      console.log('User data:', { username, firstName, lastName, name });

      // Используем ON CONFLICT для upsert операции
      const result = await client.query(`
        INSERT INTO users ("telegramId", "username", "firstName", "lastName", "photoUrl", "languageCode", "isPremium", "name", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT ("telegramId") 
        DO UPDATE SET 
          "username" = EXCLUDED."username",
          "firstName" = EXCLUDED."firstName",
          "lastName" = EXCLUDED."lastName",
          "photoUrl" = EXCLUDED."photoUrl",
          "languageCode" = EXCLUDED."languageCode",
          "isPremium" = EXCLUDED."isPremium",
          "name" = EXCLUDED."name",
          "updatedAt" = NOW()
        RETURNING *
      `, [telegramId, username, firstName, lastName, photoUrl, languageCode, isPremium, name]);

      user = result.rows[0];
      console.log('User created/updated successfully:', user ? 'Yes' : 'No');
      if (user) {
        console.log('User ID:', user.id, 'TelegramID:', user.telegramId);
      }
    } finally {
      client.release();
    }



    // Возвращаем данные пользователя
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          photoUrl: user.photoUrl,
          languageCode: user.languageCode,
          isPremium: user.isPremium
        }
      }
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString()
    });
    
    // Определяем тип ошибки для более точного ответа
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        errorMessage = 'Database error';
        console.error('Database operation failed');
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        statusCode = 400;
        errorMessage = 'Validation error';
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

// GET метод для проверки текущей сессии
export async function GET(request: NextRequest) {
  let client;
  try {
    const pool = getPool();
    client = await pool.connect();
    const telegramId = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!telegramId) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'No session token' },
        { status: 200 }
      );
    }

    const result = await client.query(`
      SELECT id, "telegramId", username, "firstName", "lastName", name, "photoUrl", "languageCode", "isPremium"
      FROM users
      WHERE "telegramId" = $1
    `, [telegramId]);

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Invalid session' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: { user }
    });

  } catch (error) {
    console.error('Session check error:', error);
    
    // Специальная обработка ошибок подключения
    if (error instanceof Error) {
      if (error.message.includes('Connection terminated') || 
          error.message.includes('timeout') ||
          error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { success: false, error: 'Database connection error' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}