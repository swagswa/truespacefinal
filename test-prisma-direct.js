require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Use direct URL for testing to avoid pooler prepared statement issues
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function testPrismaWithDirectConnection() {
  try {
    console.log('Testing Prisma client with direct Supabase connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Prisma connected to Supabase database via direct connection!');
    
    // Test creating a theme
    console.log('\n📝 Testing Theme creation...');
    const theme = await prisma.theme.create({
      data: {
        slug: 'test-theme-direct',
        title: 'Test Theme Direct',
        description: 'This is a test theme via direct connection',
        icon: '🧪'
      }
    });
    console.log('✅ Theme created:', theme);
    
    // Test creating a subtopic
    console.log('\n📝 Testing Subtopic creation...');
    const subtopic = await prisma.subtopic.create({
      data: {
        slug: 'test-subtopic-direct',
        title: 'Test Subtopic Direct',
        description: 'This is a test subtopic via direct connection',
        themeId: theme.id
      }
    });
    console.log('✅ Subtopic created:', subtopic);
    
    // Test creating a lesson
    console.log('\n📝 Testing Lesson creation...');
    const lesson = await prisma.lesson.create({
      data: {
        slug: 'test-lesson-direct',
        title: 'Test Lesson Direct',
        description: 'This is a test lesson description via direct connection',
        content: 'This is test lesson content via direct connection',
        subtopicId: subtopic.id
      }
    });
    console.log('✅ Lesson created:', lesson);
    
    // Test reading data with relations
    console.log('\n📖 Testing data reading with relations...');
    const themeWithRelations = await prisma.theme.findFirst({
      where: { id: theme.id },
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
    await prisma.lesson.deleteMany({ where: { slug: 'test-lesson-direct' } });
    await prisma.subtopic.deleteMany({ where: { slug: 'test-subtopic-direct' } });
    await prisma.theme.deleteMany({ where: { slug: 'test-theme-direct' } });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All Prisma tests with direct connection passed successfully!');
    
  } catch (error) {
    console.error('❌ Prisma test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaWithDirectConnection();