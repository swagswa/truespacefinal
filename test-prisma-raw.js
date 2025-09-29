require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrismaWithRawSQL() {
  try {
    console.log('Testing Prisma client with raw SQL queries...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Prisma connected to Supabase database!');
    
    // Test creating a theme with raw SQL
    console.log('\n📝 Testing Theme creation with raw SQL...');
    const themeResult = await prisma.$queryRaw`
      INSERT INTO themes (slug, title, description, icon, "createdAt", "updatedAt")
      VALUES ('test-theme-raw', 'Test Theme Raw', 'This is a test theme with raw SQL', '🧪', NOW(), NOW())
      RETURNING *
    `;
    console.log('✅ Theme created with raw SQL:', themeResult[0]);
    const themeId = themeResult[0].id;
    
    // Test creating a subtopic with raw SQL
    console.log('\n📝 Testing Subtopic creation with raw SQL...');
    const subtopicResult = await prisma.$queryRaw`
      INSERT INTO subtopics (title, slug, description, "themeId", "createdAt", "updatedAt")
      VALUES ('Test Subtopic Raw', 'test-subtopic-raw', 'This is a test subtopic with raw SQL', ${themeId}, NOW(), NOW())
      RETURNING *
    `;
    console.log('✅ Subtopic created with raw SQL:', subtopicResult[0]);
    const subtopicId = subtopicResult[0].id;
    
    // Test creating a lesson with raw SQL
    console.log('\n📝 Testing Lesson creation with raw SQL...');
    const lessonResult = await prisma.$queryRaw`
      INSERT INTO lessons (title, slug, description, content, duration, "subtopicId", "createdAt", "updatedAt")
      VALUES ('Test Lesson Raw', 'test-lesson-raw', 'Test lesson description', 'This is test lesson content with raw SQL', 0, ${subtopicId}, NOW(), NOW())
      RETURNING *
    `;
    console.log('✅ Lesson created with raw SQL:', lessonResult[0]);
    const lessonId = lessonResult[0].id;
    
    // Test creating a user with raw SQL
    console.log('\n📝 Testing User creation with raw SQL...');
    const userResult = await prisma.$queryRaw`
      INSERT INTO users (email, name, "createdAt", "updatedAt")
      VALUES ('test-raw@example.com', 'Test User Raw', NOW(), NOW())
      RETURNING *
    `;
    console.log('✅ User created with raw SQL:', userResult[0]);
    const userId = userResult[0].id;
    
    // Test reading data with joins
    console.log('\n📖 Testing data reading with joins...');
    const themeWithRelations = await prisma.$queryRaw`
      SELECT 
        t.id as theme_id, t.title as theme_title, t.description as theme_description, t.icon,
        s.id as subtopic_id, s.title as subtopic_title, s.description as subtopic_description,
        l.id as lesson_id, l.title as lesson_title, l.description as lesson_description, l.content
      FROM themes t
      LEFT JOIN subtopics s ON t.id = s."themeId"
      LEFT JOIN lessons l ON s.id = l."subtopicId"
      WHERE t.id = ${themeId}
    `;
    console.log('✅ Theme with relations:', themeWithRelations);
    
    // Test creating user favorite lesson
    console.log('\n📝 Testing UserFavoriteLesson creation with raw SQL...');
    const favoriteResult = await prisma.$queryRaw`
      INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
      VALUES (${userId}, ${lessonId}, NOW())
      RETURNING *
    `;
    console.log('✅ UserFavoriteLesson created with raw SQL:', favoriteResult[0]);
    
    // Test creating user lesson completion
    console.log('\n📝 Testing UserLessonCompletion creation with raw SQL...');
    const completionResult = await prisma.$queryRaw`
      INSERT INTO user_lesson_completions ("userId", "lessonId", "completedAt", "createdAt", "updatedAt")
      VALUES (${userId}, ${lessonId}, NOW(), NOW(), NOW())
      RETURNING *
    `;
    console.log('✅ UserLessonCompletion created with raw SQL:', completionResult[0]);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await prisma.$executeRaw`DELETE FROM user_lesson_completions WHERE "userId" = ${userId}`;
    await prisma.$executeRaw`DELETE FROM user_favorite_lessons WHERE "userId" = ${userId}`;
    await prisma.$executeRaw`DELETE FROM users WHERE id = ${userId}`;
    await prisma.$executeRaw`DELETE FROM lessons WHERE id = ${lessonId}`;
    await prisma.$executeRaw`DELETE FROM subtopics WHERE id = ${subtopicId}`;
    await prisma.$executeRaw`DELETE FROM themes WHERE id = ${themeId}`;
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All Prisma tests with raw SQL passed successfully!');
    console.log('\n✅ Database schema is working correctly with Prisma!');
    
  } catch (error) {
    console.error('❌ Prisma test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaWithRawSQL();