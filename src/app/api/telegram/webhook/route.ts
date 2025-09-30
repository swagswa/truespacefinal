import { NextRequest, NextResponse } from 'next/server';

// Типы для Telegram API
interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: {
    id: number;
    type: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// Интерфейс для разметки клавиатуры
interface InlineKeyboardMarkup {
  inline_keyboard: Array<Array<{
    text: string;
    web_app?: { url: string };
  }>>;
}

// Функция для отправки сообщений через Telegram Bot API
async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: InlineKeyboardMarkup) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup: replyMarkup,
        parse_mode: 'HTML'
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Telegram API error:', result);
      return false;
    }

    console.log('✅ Message sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return false;
  }
}

// Обработчик команды /start
async function handleStartCommand(chatId: number, user: TelegramUser) {
  const webAppUrl = process.env.NEXTAUTH_URL || 'https://truespacefinal.vercel.app';
  
  const welcomeText = `
👋 Привет, ${user.first_name}!

Добро пожаловать в наше обучающее приложение!

Нажмите кнопку ниже, чтобы открыть Web App и начать изучение уроков.

🔐 Ваши данные будут автоматически переданы в приложение для аутентификации.
  `;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "🚀 Открыть приложение",
          web_app: {
            url: webAppUrl
          }
        }
      ]
    ]
  };

  return await sendTelegramMessage(chatId, welcomeText, replyMarkup);
}

// Обработчик команды /help
async function handleHelpCommand(chatId: number) {
  const helpText = `
🤖 Команды бота:

/start - Запустить бота и открыть Web App
/help - Показать это сообщение
/webapp - Открыть Web App напрямую

📱 Для использования приложения просто нажмите кнопку "Открыть приложение"
  `;

  return await sendTelegramMessage(chatId, helpText);
}

// Обработчик команды /webapp
async function handleWebAppCommand(chatId: number) {
  const webAppUrl = process.env.NEXTAUTH_URL || 'https://truespacefinal.vercel.app';
  
  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "🚀 Открыть Web App",
          web_app: {
            url: webAppUrl
          }
        }
      ]
    ]
  };

  return await sendTelegramMessage(chatId, "Нажмите кнопку ниже, чтобы открыть приложение:", replyMarkup);
}

// Основной обработчик webhook
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Telegram webhook received');
    
    // Проверяем наличие токена бота
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    // Парсим тело запроса
    const update: TelegramUpdate = await request.json();
    console.log('📨 Update received:', JSON.stringify(update, null, 2));

    // Проверяем наличие сообщения
    if (!update.message) {
      console.log('ℹ️ No message in update, ignoring');
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text;
    const user = message.from;

    if (!user) {
      console.log('ℹ️ No user in message, ignoring');
      return NextResponse.json({ ok: true });
    }

    console.log(`👤 User: ${user.first_name} (${user.id})`);
    console.log(`💬 Message: ${text}`);

    // Обрабатываем команды
    if (text?.startsWith('/')) {
      const command = text.split(' ')[0].toLowerCase();
      
      switch (command) {
        case '/start':
          await handleStartCommand(chatId, user);
          break;
        case '/help':
          await handleHelpCommand(chatId);
          break;
        case '/webapp':
          await handleWebAppCommand(chatId);
          break;
        default:
          await sendTelegramMessage(chatId, 'Неизвестная команда. Используйте /help для списка команд.');
      }
    } else {
      // Обрабатываем обычные сообщения
      await sendTelegramMessage(
        chatId, 
        'Привет! Используйте /start чтобы открыть приложение или /help для списка команд.'
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Обработчик GET запросов (для проверки работоспособности)
export async function GET() {
  return NextResponse.json({ 
    status: 'Telegram webhook is running',
    timestamp: new Date().toISOString()
  });
}