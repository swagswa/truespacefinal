// Скрипт для установки тестового пользователя в localStorage
// Запустите этот код в консоли браузера на странице localhost:3000

console.log('Устанавливаю тестового пользователя...');

// Устанавливаем telegramId в localStorage
localStorage.setItem('telegramId', '14');

console.log('Тестовый пользователь установлен!');
console.log('telegramId:', localStorage.getItem('telegramId'));

// Перезагружаем страницу для применения изменений
window.location.reload();