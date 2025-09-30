// Используем встроенный fetch в Node.js 18+

const BASE_URL = 'http://localhost:3000';
const TELEGRAM_ID = '14';

async function testAPI() {
  console.log('Testing API endpoints with telegramId:', TELEGRAM_ID);
  console.log('='.repeat(50));

  // Test POST /api/favorites
  console.log('\n1. Testing POST /api/favorites');
  try {
    const favoritesResponse = await fetch(`${BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TELEGRAM_ID}`
      },
      body: JSON.stringify({
        lessonId: 1
      })
    });

    const favoritesData = await favoritesResponse.text();
    console.log('Status:', favoritesResponse.status);
    console.log('Response:', favoritesData);
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test GET /api/favorites
  console.log('\n2. Testing GET /api/favorites');
  try {
    const getFavoritesResponse = await fetch(`${BASE_URL}/api/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TELEGRAM_ID}`
      }
    });

    const getFavoritesData = await getFavoritesResponse.text();
    console.log('Status:', getFavoritesResponse.status);
    console.log('Response:', getFavoritesData);
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test POST /api/completed
  console.log('\n3. Testing POST /api/completed');
  try {
    const completedResponse = await fetch(`${BASE_URL}/api/completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TELEGRAM_ID}`
      },
      body: JSON.stringify({
        lessonId: 1
      })
    });

    const completedData = await completedResponse.text();
    console.log('Status:', completedResponse.status);
    console.log('Response:', completedData);
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test GET /api/completed
  console.log('\n4. Testing GET /api/completed');
  try {
    const getCompletedResponse = await fetch(`${BASE_URL}/api/completed`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TELEGRAM_ID}`
      }
    });

    const getCompletedData = await getCompletedResponse.text();
    console.log('Status:', getCompletedResponse.status);
    console.log('Response:', getCompletedData);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();