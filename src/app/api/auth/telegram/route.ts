import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

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
    const { initData } = await request.json();

    if (!initData) {
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
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid initData' },
        { status: 401 }
      );
    }

    // Ищем или создаем пользователя
    let user = await prisma.user.findUnique({
      where: { telegramId: userData.id.toString() }
    });

    if (!user) {
      // Создаем нового пользователя
      user = await prisma.user.create({
        data: {
          telegramId: userData.id.toString(),
          username: userData.username || null,
          firstName: userData.first_name || null,
          lastName: userData.last_name || null,
          photoUrl: userData.photo_url || null,
          languageCode: userData.language_code || null,
          isPremium: userData.is_premium || false,
          name: userData.first_name || userData.username || 'Telegram User'
        }
      });
    } else {
      // Обновляем существующего пользователя
      user = await prisma.user.update({
        where: { telegramId: userData.id.toString() },
        data: {
          username: userData.username || user.username,
          firstName: userData.first_name || user.firstName,
          lastName: userData.last_name || user.lastName,
          photoUrl: userData.photo_url || user.photoUrl,
          languageCode: userData.language_code || user.languageCode,
          isPremium: userData.is_premium || user.isPremium,
          name: userData.first_name || userData.username || user.name
        }
      });
    }

    // Создаем JWT токен или сессию
    const sessionId = crypto.randomUUID();
    
    // Обновляем пользователя с новой сессией
    await prisma.user.update({
      where: { id: user.id },
      data: { sessionId }
    });

    // Возвращаем данные пользователя и токен
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
        },
        sessionId
      }
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET метод для проверки текущей сессии
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session token' },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}