// Test script to create a lesson and verify functionality
async function testCreateLesson() {
  try {
    console.log('Testing lesson creation...');
    
    // First, get subtopics to use one as subtopicId
    const subtopicsResponse = await fetch('http://localhost:3000/api/admin/subtopics');
    const subtopicsData = await subtopicsResponse.json();
    
    console.log('Subtopics response:', JSON.stringify(subtopicsData, null, 2));
    
    if (!subtopicsData.success || !subtopicsData.data || subtopicsData.data.length === 0) {
      console.log('No subtopics available, need to create one first...');
      console.log('Please create a subtopic through the admin interface first.');
      return;
    }
    
    const subtopicId = subtopicsData.data[0].id;
    console.log('Using subtopic ID:', subtopicId, 'Title:', subtopicsData.data[0].title);
    
    // Create a test lesson
    const lessonData = {
      title: 'Test Lesson',
      description: 'This is a test lesson',
      content: 'Test lesson content',
      subtopicId: subtopicId
    };
    
    const response = await fetch('http://localhost:3000/api/admin/lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData)
    });
    
    console.log('Create lesson status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Create lesson result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✓ Lesson created successfully');
      
      // Now test fetching lessons again
      const lessonsResponse = await fetch('http://localhost:3000/api/admin/lessons');
      const lessonsData = await lessonsResponse.json();
      console.log('Lessons after creation:', JSON.stringify(lessonsData, null, 2));
      
      if (lessonsData.success && lessonsData.data.lessons.length > 0) {
        console.log('✓ Lesson appears in lessons list');
      }
    } else {
      console.log('✗ Failed to create lesson:', result.error);
    }
    
  } catch (error) {
    console.error('Error testing lesson creation:', error);
  }
}

testCreateLesson();