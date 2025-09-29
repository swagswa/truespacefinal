const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrismaClient() {
  try {
    console.log('Testing Prisma client with Supabase...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Prisma connected to Supabase database!');
    
    // Test creating a theme
    console.log('\n📝 Testing Theme creation...');
    const theme = await prisma.theme.create({
      data: {
        slug: 'test-theme',
        title: 'Test Theme',
        description: 'This is a test theme',
        icon: '🧪'
      }
    });
    console.log('✅ Theme created:', theme);
    
    // Test creating a subtopic
    console.log('\n📝 Testing Subtopic creation...');
    const subtopic = await prisma.subtopic.create({
      data: {
        slug: 'test-subtopic',
        title: 'Test Subtopic',
        description: 'This is a test subtopic',
        themeId: theme.id
      }
    });
    console.log('✅ Subtopic created:', subtopic);
    
    // Test creating a lesson
    console.log('\n📝 Testing Lesson creation...');
    const lesson = await prisma.lesson.create({
      data: {
        slug: 'test-lesson',
        title: 'Test Lesson',
        description: 'This is a test lesson description',
        content: 'This is test lesson content',
        subtopicId: subtopic.id
      }
    });
    console.log('✅ Lesson created:', lesson);
    
    // Test creating a user
    console.log('\n📝 Testing User creation...');
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });
    console.log('✅ User created:', user);
    
    // Test creating user favorite lesson
    console.log('\n📝 Testing UserFavoriteLesson creation...');
    const favorite = await prisma.userFavoriteLesson.create({
      data: {
        userId: user.id,
        lessonId: lesson.id
      }
    });
    console.log('✅ UserFavoriteLesson created:', favorite);
    
    // Test creating user lesson completion
    console.log('\n📝 Testing UserLessonCompletion creation...');
    const completion = await prisma.userLessonCompletion.create({
      data: {
        userId: user.id,
        lessonId: lesson.id
      }
    });
    console.log('✅ UserLessonCompletion created:', completion);
    
    // Test reading data with relations
    console.log('\n📖 Testing data reading with relations...');
    const themeWithRelations = await prisma.theme.findFirst({
      include: {
        subtopics: {
          include: {
            lessons: true
          }
        }
      }
    });
    console.log('✅ Theme with relations:', JSON.stringify(themeWithRelations, null, 2));
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await prisma.userLessonCompletion.deleteMany();
    await prisma.userFavoriteLesson.deleteMany();
    await prisma.user.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.subtopic.deleteMany();
    await prisma.theme.deleteMany();
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All Prisma tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Prisma test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaClient();