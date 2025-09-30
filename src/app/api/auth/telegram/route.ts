import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

// Функция для валидации Telegram initData (упрощенная версия для веб-приложений)
function validateTelegramInitData(initData: string): TelegramUser {
  try {
    const urlParams = new URLSearchParams(initData);
    
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

    const userData = JSON.parse(userDataString);
    
    // Базовая проверка обязательных полей
    if (!userData.id || !userData.first_name) {
      throw new Error('Invalid user data');
    }

    return userData;
  } catch (error) {
    throw new Error(`Validation failed: ${error}`);
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 Telegram auth endpoint called');
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('📍 Vercel Region:', process.env.VERCEL_REGION || 'local');
  
  let pool;
  
  try {

    // Проверяем Content-Type
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.log('❌ Invalid Content-Type');
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // Проверяем Content-Length
    const contentLength = request.headers.get('content-length');
    console.log('Content-Length:', contentLength);
    
    if (!contentLength || parseInt(contentLength) === 0) {
      console.log('❌ Empty request body');
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400 }
      );
    }

    // Парсим JSON
    let body;
    try {
      body = await request.json();
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    const { initData } = body;
    console.log('InitData received:', initData ? 'Yes' : 'No', initData ? `(length: ${initData.length})` : '');

    if (!initData) {
      console.log('❌ Missing initData');
      return NextResponse.json(
        { success: false, error: 'initData is required' },
        { status: 400 }
      );
    }

    // Валидируем initData
    let userData;
    try {
      userData = validateTelegramInitData(initData);
      console.log('✅ InitData validation successful');
      console.log('User data received:', {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name
      });
    } catch (validationError) {
      console.error('❌ InitData validation failed:', validationError);
      return NextResponse.json(
        { success: false, error: 'Invalid initData' },
        { status: 401 }
      );
    }

    // Используем upsert для создания или обновления пользователя
    console.log('🗄️ Connecting to database...');
    
    let client;
    let user;
    
    try {
      // Создаем пул соединений с базой данных (как в других рабочих роутах)
      pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
        ssl: {
          rejectUnauthorized: false
        }
      });
      client = await pool.connect();
      console.log('✅ Database client connected');
      
      const telegramId = userData.id.toString();
      const username = userData.username || null;
      const firstName = userData.first_name || null;
      const lastName = userData.last_name || null;
      const photoUrl = userData.photo_url || null;
      const languageCode = userData.language_code || null;
      const isPremium = userData.is_premium || false;
      const name = userData.first_name || userData.username || 'Telegram User';

      console.log('📝 Creating/updating user with telegramId:', telegramId);
      console.log('📝 User data:', { username, firstName, lastName, name });

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
      console.log('✅ User created/updated successfully:', user ? 'Yes' : 'No');
      if (user) {
        console.log('👤 User ID:', user.id, 'TelegramID:', user.telegramId);
      }
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      console.error('Database error details:', {
        name: dbError instanceof Error ? dbError.name : 'Unknown',
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        code: (dbError as { code?: string })?.code,
        detail: (dbError as { detail?: string })?.detail,
        hint: (dbError as { hint?: string })?.hint,
        position: (dbError as { position?: string })?.position,
        routine: (dbError as { routine?: string })?.routine
      });
      throw dbError; // Re-throw to be caught by outer catch block
    } finally {
      if (client) {
        client.release();
        console.log('🔓 Database client released');
      }
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
    console.error('❌ Telegram auth error:', error);
    console.error('🔍 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercelRegion: process.env.VERCEL_REGION || 'local'
    });
    
    // Определяем тип ошибки для более точного ответа
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('database') || errorMsg.includes('connection') || errorMsg.includes('pool')) {
        errorMessage = 'Database connection error';
        errorCode = 'DATABASE_ERROR';
        console.error('💾 Database operation failed');
      } else if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
        statusCode = 400;
        errorMessage = 'Validation error';
        errorCode = 'VALIDATION_ERROR';
      } else if (errorMsg.includes('timeout')) {
        errorMessage = 'Request timeout';
        errorCode = 'TIMEOUT_ERROR';
      } else if (errorMsg.includes('environment') || errorMsg.includes('config')) {
        errorMessage = 'Server configuration error';
        errorCode = 'CONFIG_ERROR';
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  } finally {
    // Закрываем пул соединений
    if (pool) {
      try {
        await pool.end();
        console.log('🔓 Database pool closed');
      } catch (poolError) {
        console.error('Error closing pool:', poolError);
      }
    }
  }
}

// GET метод для проверки текущей сессии
export async function GET(request: NextRequest) {
  let client;
  let pool;
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
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
    // Закрываем пул соединений
    if (pool) {
      try {
        await pool.end();
        console.log('🔓 Database pool closed (GET)');
      } catch (poolError) {
        console.error('Error closing pool (GET):', poolError);
      }
    }
  }
}