// Using built-in fetch (Node.js 18+)

async function testAuthEndpoints() {
  console.log('Testing API endpoints with proper authentication...\n');
  
  // Test with a mock telegramId (this should still return 401 since user doesn't exist)
  const mockTelegramId = '123456789';
  
  const endpoints = [
    '/api/favorites/lessons',
    '/api/completed/lessons'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      
      // Test without Authorization header (should return 401)
      const responseNoAuth = await fetch(`http://localhost:3000${endpoint}`);
      console.log(`  Without auth: ${responseNoAuth.status} ${responseNoAuth.statusText}`);
      
      // Test with Authorization header (should return 401 but for different reason - user not found)
      const responseWithAuth = await fetch(`http://localhost:3000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${mockTelegramId}`
        }
      });
      console.log(`  With auth: ${responseWithAuth.status} ${responseWithAuth.statusText}`);
      
      // Check if the response includes proper error message
      const responseText = await responseWithAuth.text();
      console.log(`  Response: ${responseText}`);
      
    } catch (error) {
      console.error(`  Error testing ${endpoint}:`, error.message);
    }
    
    console.log('');
  }
  
  console.log('Test completed!');
}

testAuthEndpoints().catch(console.error);