const http = require('http');

async function testAPI() {
  console.log('🧪 Testing API routes...');
  
  try {
    // Test /api/themes
    const response = await fetch('http://localhost:3000/api/themes');
    const data = await response.json();
    
    console.log('📊 /api/themes response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ API route is working!');
    } else {
      console.log('❌ API route failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Wait a bit for server to be ready, then test
setTimeout(testAPI, 2000);