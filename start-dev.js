#!/usr/bin/env node

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск разработки с интеграцией Telegram бота...\n');

// Функция для запуска Telegram бота
function startTelegramBot() {
  console.log('🤖 Запуск Telegram бота (polling)...');
  
  const botProcess = spawn('node', ['telegram-bot-polling.js'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
  });

  botProcess.on('error', (err) => {
    console.error('❌ Ошибка запуска Telegram бота:', err);
  });

  // Обработка завершения процесса
  process.on('SIGINT', () => {
    console.log('\n🛑 Завершение работы бота...');
    botProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    botProcess.kill('SIGTERM');
  });

  return botProcess;
}

// Функция для запуска Next.js
function startNextJS() {
  console.log('🌐 Запуск Next.js сервера разработки...');
  
  const nextProcess = spawn('npm', ['run', 'dev:next'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  nextProcess.on('error', (err) => {
    console.error('❌ Ошибка запуска Next.js:', err);
    process.exit(1);
  });

  // Обработка завершения процесса
  process.on('SIGINT', () => {
    console.log('\n🛑 Завершение работы...');
    nextProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    nextProcess.kill('SIGTERM');
    process.exit(0);
  });
}

// Основная функция
async function main() {
  try {
    // Запускаем Telegram бота в фоне
    const botProcess = startTelegramBot();
    
    // Небольшая пауза для запуска бота
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Затем запускаем Next.js
    startNextJS();
    
  } catch (error) {
    console.error('❌ Ошибка при запуске:', error);
    process.exit(1);
  }
}

main();