require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function createFreshPrismaClient() {
  return new PrismaClient();
}

async function testPrismaWithFreshInstances() {
  let prisma;
  
  try {
    console.log('Testing Prisma client with fresh instances...');
    
    // Test connection
    prisma = await createFreshPrismaClient();
    await prisma.$connect();
    console.log('✅ Prisma connected to Supabase database!');
    await prisma.$disconnect();
    
    // Test creating a theme
    console.log('\n📝 Testing Theme creation...');
    prisma = await createFreshPrismaClient();
    const theme = await prisma.theme.create({
      data: {
        slug: 'test-theme-fresh',
        title: 'Test Theme Fresh',
        description: 'This is a test theme with fresh instance',
        icon: '🧪'
      }
    });
    console.log('✅ Theme created:', theme);
    await prisma.$disconnect();
    
    // Test creating a subtopic
    console.log('\n📝 Testing Subtopic creation...');
    prisma = await createFreshPrismaClient();
    const subtopic = await prisma.subtopic.create({
      data: {
        slug: 'test-subtopic-fresh',
        title: 'Test Subtopic Fresh',
        description: 'This is a test subtopic with fresh instance',
        themeId: theme.id
      }
    });
    console.log('✅ Subtopic created:', subtopic);
    await prisma.$disconnect();
    
    // Test creating a lesson
    console.log('\n📝 Testing Lesson creation...');
    prisma = await createFreshPrismaClient();
    const lesson = await prisma.lesson.create({
      data: {
        slug: 'test-lesson-fresh',
        title: 'Test Lesson Fresh',
        description: 'This is a test lesson description with fresh instance',
        content: 'This is test lesson content with fresh instance',
        subtopicId: subtopic.id
      }
    });
    console.log('✅ Lesson created:', lesson);
    await prisma.$disconnect();
    
    // Test creating a user
    console.log('\n📝 Testing User creation...');
    prisma = await createFreshPrismaClient();
    const user = await prisma.user.create({
      data: {
        email: 'test-fresh@example.com',
        name: 'Test User Fresh'
      }
    });
    console.log('✅ User created:', user);
    await prisma.$disconnect();
    
    // Test reading data with relations
    console.log('\n📖 Testing data reading with relations...');
    prisma = await createFreshPrismaClient();
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
    await prisma.$disconnect();
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    prisma = await createFreshPrismaClient();
    await prisma.user.deleteMany({ where: { email: 'test-fresh@example.com' } });
    await prisma.lesson.deleteMany({ where: { slug: 'test-lesson-fresh' } });
    await prisma.subtopic.deleteMany({ where: { slug: 'test-subtopic-fresh' } });
    await prisma.theme.deleteMany({ where: { slug: 'test-theme-fresh' } });
    console.log('✅ Test data cleaned up');
    await prisma.$disconnect();
    
    console.log('\n🎉 All Prisma tests with fresh instances passed successfully!');
    
  } catch (error) {
    console.error('❌ Prisma test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

testPrismaWithFreshInstances();