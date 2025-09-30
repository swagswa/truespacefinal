#!/usr/bin/env node

const dotenv = require('dotenv');
const result = dotenv.config();
console.log('🔧 Dotenv result:', result);
const https = require('https');

class TelegramBot {
  constructor(token) {
    this.token = token;
    this.offset = 0;
    this.isRunning = false;
    
    console.log('🔍 Environment variables:');
    console.log('WEB_APP_URL:', process.env.WEB_APP_URL);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
    this.webAppUrl = process.env.WEB_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3001';
    console.log('🌐 Final webAppUrl:', this.webAppUrl);
  }

  // Отправка HTTP запроса к Telegram API
  makeRequest(method, data = {}) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${this.token}/${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            if (result.ok) {
              resolve(result.result);
            } else {
              reject(new Error(`Telegram API Error: ${result.description}`));
            }
          } catch (error) {
            reject(new Error(`Parse Error: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  // Отправка сообщения
  async sendMessage(chatId, text, replyMarkup = null) {
    const data = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };

    if (replyMarkup) {
      data.reply_markup = replyMarkup;
    }

    try {
      return await this.makeRequest('sendMessage', data);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error.message);
    }
  }

  // Получение обновлений
  async getUpdates() {
    try {
      const updates = await this.makeRequest('getUpdates', {
        offset: this.offset,
        timeout: 10,
        allowed_updates: ['message']
      });

      if (updates && updates.length > 0) {
        this.offset = updates[updates.length - 1].update_id + 1;
        return updates;
      }

      return [];
    } catch (error) {
      console.error('Ошибка получения обновлений:', error.message);
      return [];
    }
  }

  // Обработка команды /start
  async handleStartCommand(chatId, firstName) {
    const welcomeText = `
🎓 <b>Добро пожаловать в TrueUrok, ${firstName}!</b>

Это образовательная платформа для изучения различных предметов.

Нажмите кнопку ниже, чтобы открыть приложение:
    `;

    const keyboard = {
      inline_keyboard: [[
        {
          text: "🚀 Открыть TrueUrok",
          web_app: { url: this.webAppUrl }
        }
      ]]
    };

    await this.sendMessage(chatId, welcomeText, keyboard);
  }

  // Обработка команды /help
  async handleHelpCommand(chatId) {
    const helpText = `
📚 <b>Помощь по TrueUrok</b>

<b>Доступные команды:</b>
/start - Начать работу с ботом
/help - Показать эту справку
/webapp - Открыть веб-приложение

<b>Что можно делать:</b>
• Изучать уроки по различным предметам
• Проходить тесты и задания
• Отслеживать свой прогресс
• Получать сертификаты

Нажмите /start чтобы начать обучение!
    `;

    await this.sendMessage(chatId, helpText);
  }

  // Обработка команды /webapp
  async handleWebAppCommand(chatId) {
    const webappText = `
🌐 <b>Веб-приложение TrueUrok</b>

Нажмите кнопку ниже, чтобы открыть полную версию приложения:
    `;

    const keyboard = {
      inline_keyboard: [[
        {
          text: "🚀 Открыть приложение",
          web_app: { url: this.webAppUrl }
        }
      ]]
    };

    await this.sendMessage(chatId, webappText, keyboard);
  }

  // Обработка сообщения
  async handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text;
    const firstName = message.from.first_name || 'Пользователь';

    console.log(`📨 Сообщение от ${firstName} (${chatId}): ${text}`);

    if (text.startsWith('/start')) {
      await this.handleStartCommand(chatId, firstName);
    } else if (text === '/help') {
      await this.handleHelpCommand(chatId);
    } else if (text === '/webapp') {
      await this.handleWebAppCommand(chatId);
    } else {
      // Обработка обычных сообщений
      const responseText = `
Привет, ${firstName}! 👋

Я бот TrueUrok. Используйте команды:
/start - Начать работу
/help - Получить помощь
/webapp - Открыть приложение

Или нажмите кнопку ниже:
      `;

      const keyboard = {
        inline_keyboard: [[
          {
            text: "🚀 Открыть TrueUrok",
            web_app: { url: this.webAppUrl }
          }
        ]]
      };

      await this.sendMessage(chatId, responseText, keyboard);
    }
  }

  // Основной цикл бота
  async start() {
    console.log('🤖 Запуск Telegram бота...');
    console.log(`🔧 WEB_APP_URL: ${process.env.WEB_APP_URL}`);
    console.log(`🔧 NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
    
    try {
      // Проверяем токен
      const me = await this.makeRequest('getMe');
      console.log(`✅ Бот запущен: @${me.username} (${me.first_name})`);
      console.log(`🌐 Web App URL: ${this.webAppUrl}`);
      
      this.isRunning = true;
      
      // Основной цикл polling
      while (this.isRunning) {
        try {
          const updates = await this.getUpdates();
          
          for (const update of updates) {
            if (update.message) {
              await this.handleMessage(update.message);
            }
          }
        } catch (error) {
          console.error('Ошибка в цикле polling:', error.message);
          // Небольшая пауза при ошибке
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    } catch (error) {
      console.error('❌ Ошибка запуска бота:', error.message);
      process.exit(1);
    }
  }

  // Остановка бота
  stop() {
    console.log('🛑 Остановка бота...');
    this.isRunning = false;
  }
}

// Запуск бота
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
    process.exit(1);
  }

  const bot = new TelegramBot(token);

  // Обработка сигналов завершения
  process.on('SIGINT', () => {
    bot.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    bot.stop();
    process.exit(0);
  });

  await bot.start();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TelegramBot;