async function testPostAPI() {
  const baseUrl = 'http://localhost:3000';
  const telegramId = '6338779682'; // Из логов
  
  console.log('🧪 Тестирование POST API запросов...\n');
  
  // Тест POST /api/completed
  console.log('📝 Тестирование POST /api/completed');
  try {
    const completedResponse = await fetch(`${baseUrl}/api/completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${telegramId}`
      },
      body: JSON.stringify({
        lessonId: 1
      })
    });
    
    console.log(`Статус: ${completedResponse.status}`);
    const completedData = await completedResponse.text();
    console.log(`Ответ: ${completedData}\n`);
  } catch (error) {
    console.error('Ошибка POST /api/completed:', error.message);
  }
  
  // Тест POST /api/favorites
  console.log('⭐ Тестирование POST /api/favorites');
  try {
    const favoritesResponse = await fetch(`${baseUrl}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${telegramId}`
      },
      body: JSON.stringify({
        lessonId: 1
      })
    });
    
    console.log(`Статус: ${favoritesResponse.status}`);
    const favoritesData = await favoritesResponse.text();
    console.log(`Ответ: ${favoritesData}\n`);
  } catch (error) {
    console.error('Ошибка POST /api/favorites:', error.message);
  }
  
  // Тест GET для сравнения
  console.log('📊 Тестирование GET /api/completed для сравнения');
  try {
    const getResponse = await fetch(`${baseUrl}/api/completed`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${telegramId}`
      }
    });
    
    console.log(`Статус: ${getResponse.status}`);
    const getData = await getResponse.text();
    console.log(`Ответ: ${getData}`);
  } catch (error) {
    console.error('Ошибка GET /api/completed:', error.message);
  }
}

testPostAPI().catch(console.error);