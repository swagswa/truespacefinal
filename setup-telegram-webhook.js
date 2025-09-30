#!/usr/bin/env node

/**
 * Скрипт для настройки Telegram webhook
 * Использование: node setup-telegram-webhook.js
 */

const https = require('https');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.NEXTAUTH_URL || 'https://truespacefinal.vercel.app';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
  process.exit(1);
}

console.log('🤖 Настройка Telegram webhook...');
console.log(`🔗 Webhook URL: ${WEBHOOK_URL}/api/telegram/webhook`);
console.log(`🔑 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);

// Функция для выполнения HTTP запросов
function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function setupWebhook() {
  try {
    // 1. Получаем информацию о боте
    console.log('\n📋 Получение информации о боте...');
    const botInfo = await makeRequest(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    
    if (!botInfo.ok) {
      throw new Error(`Ошибка получения информации о боте: ${botInfo.description}`);
    }
    
    console.log(`✅ Бот найден: @${botInfo.result.username} (${botInfo.result.first_name})`);

    // 2. Удаляем существующий webhook
    console.log('\n🗑️ Удаление существующего webhook...');
    const deleteResult = await makeRequest(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    
    if (deleteResult.ok) {
      console.log('✅ Существующий webhook удален');
    } else {
      console.log('ℹ️ Webhook не был установлен ранее');
    }

    // 3. Устанавливаем новый webhook
    console.log('\n🔗 Установка нового webhook...');
    const webhookData = {
      url: `${WEBHOOK_URL}/api/telegram/webhook`,
      allowed_updates: ['message']
    };

    const setResult = await makeRequest(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      webhookData
    );

    if (!setResult.ok) {
      throw new Error(`Ошибка установки webhook: ${setResult.description}`);
    }

    console.log('✅ Webhook успешно установлен!');

    // 4. Проверяем статус webhook
    console.log('\n🔍 Проверка статуса webhook...');
    const webhookInfo = await makeRequest(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    
    if (webhookInfo.ok) {
      const info = webhookInfo.result;
      console.log('📊 Информация о webhook:');
      console.log(`   URL: ${info.url}`);
      console.log(`   Pending updates: ${info.pending_update_count}`);
      console.log(`   Last error date: ${info.last_error_date || 'Нет ошибок'}`);
      console.log(`   Last error message: ${info.last_error_message || 'Нет ошибок'}`);
    }

    console.log('\n🎉 Настройка завершена успешно!');
    console.log('\n📱 Теперь вы можете:');
    console.log('   1. Найти вашего бота в Telegram: @' + botInfo.result.username);
    console.log('   2. Отправить команду /start');
    console.log('   3. Нажать кнопку "Открыть приложение"');
    
  } catch (error) {
    console.error('\n❌ Ошибка настройки webhook:', error.message);
    process.exit(1);
  }
}

// Запускаем настройку
setupWebhook();