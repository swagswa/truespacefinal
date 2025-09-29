// Using built-in fetch (Node.js 18+)

async function testAdminSubtopicsAPI() {
  try {
    console.log('Testing /api/admin/subtopics...');
    
    const response = await fetch('http://localhost:3000/api/admin/subtopics?page=1&limit=10');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.subtopics) {
        console.log('Subtopics count:', data.subtopics.length);
        console.log('Total:', data.total);
        console.log('Page:', data.page);
        console.log('Total Pages:', data.totalPages);
        
        if (data.subtopics.length > 0) {
          console.log('First subtopic:', data.subtopics[0]);
        }
      } else {
        console.log('No subtopics property in response');
      }
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAdminSubtopicsAPI();