const { spawn } = require('child_process');
const http = require('http');

// Функция для ожидания
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Функция для проверки доступности сервера
async function waitForServer(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/api/themes`, (res) => {
          resolve(res);
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      console.log('✅ Сервер доступен');
      return true;
    } catch (error) {
      console.log(`⏳ Ожидание сервера... попытка ${i + 1}/${maxAttempts}`);
      await delay(2000);
    }
  }
  return false;
}

// Функция для выполнения HTTP запроса
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Основная функция тестирования
async function testApiRoutes() {
  console.log('🚀 Запуск тестирования API роутов...\n');

  // Запускаем dev сервер
  console.log('📦 Запуск Next.js dev сервера...');
  const server = spawn('npm', ['run', 'dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });

  let serverOutput = '';
  server.stdout.on('data', (data) => {
    serverOutput += data.toString();
    if (data.toString().includes('Ready')) {
      console.log('✅ Next.js сервер запущен');
    }
  });

  server.stderr.on('data', (data) => {
    console.log('Server stderr:', data.toString());
  });

  // Ждем запуска сервера
  console.log('⏳ Ожидание запуска сервера...');
  const serverReady = await waitForServer(3000);
  
  if (!serverReady) {
    console.log('❌ Сервер не запустился в течение ожидаемого времени');
    server.kill();
    return;
  }

  try {
    console.log('\n🧪 Начинаем тестирование API роутов...\n');

    // Тест 1: GET /api/themes
    console.log('1️⃣ Тестирование GET /api/themes');
    try {
      const themesResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/themes',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Статус: ${themesResponse.status}`);
      if (themesResponse.status === 200) {
        console.log('   ✅ Успешно получены темы');
        console.log(`   📊 Количество тем: ${themesResponse.data.themes?.length || 0}`);
      } else {
        console.log('   ❌ Ошибка при получении тем');
        console.log('   📄 Ответ:', JSON.stringify(themesResponse.data, null, 2));
      }
    } catch (error) {
      console.log('   ❌ Ошибка запроса:', error.message);
    }

    // Тест 2: GET /api/favorites
    console.log('\n2️⃣ Тестирование GET /api/favorites');
    try {
      const favoritesResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/favorites',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': 'test-session-123'
        }
      });
      
      console.log(`   Статус: ${favoritesResponse.status}`);
      if (favoritesResponse.status === 200) {
        console.log('   ✅ Успешно получены избранные');
        console.log(`   📊 Количество избранных: ${favoritesResponse.data.favorites?.length || 0}`);
      } else {
        console.log('   ❌ Ошибка при получении избранных');
        console.log('   📄 Ответ:', JSON.stringify(favoritesResponse.data, null, 2));
      }
    } catch (error) {
      console.log('   ❌ Ошибка запроса:', error.message);
    }

    // Тест 3: GET /api/completed
    console.log('\n3️⃣ Тестирование GET /api/completed');
    try {
      const completedResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/completed',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': 'test-session-123'
        }
      });
      
      console.log(`   Статус: ${completedResponse.status}`);
      if (completedResponse.status === 200) {
        console.log('   ✅ Успешно получены завершенные уроки');
        console.log(`   📊 Количество завершенных: ${completedResponse.data.completed?.length || 0}`);
      } else {
        console.log('   ❌ Ошибка при получении завершенных уроков');
        console.log('   📄 Ответ:', JSON.stringify(completedResponse.data, null, 2));
      }
    } catch (error) {
      console.log('   ❌ Ошибка запроса:', error.message);
    }

    console.log('\n✅ Тестирование API роутов завершено!');

  } catch (error) {
    console.log('❌ Ошибка во время тестирования:', error);
  } finally {
    // Останавливаем сервер
    console.log('\n🛑 Остановка сервера...');
    server.kill();
    
    // Ждем немного для корректного завершения
    await delay(2000);
    console.log('✅ Тестирование завершено');
  }
}

// Запускаем тестирование
testApiRoutes().catch(console.error);