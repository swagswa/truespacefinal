// Test script to check admin lessons API response
async function testAdminLessonsAPI() {
  try {
    console.log('Testing /api/admin/lessons endpoint...');
    
    const response = await fetch('http://localhost:3000/api/admin/lessons');
    console.log('Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Check if response has the expected structure
    if (data.success && data.data) {
      console.log('✓ API returns data in { success: true, data: [...] } format');
      console.log('Number of lessons:', data.data.length);
    } else if (data.lessons) {
      console.log('✓ API returns data in { lessons: [...] } format');
      console.log('Number of lessons:', data.lessons.length);
    } else {
      console.log('⚠ Unexpected response format');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAdminLessonsAPI();