const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getLessons() {
  try {
    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true
      },
      take: 5
    });
    
    console.log('Available lessons:');
    lessons.forEach(lesson => {
      console.log(`ID: ${lesson.id}, Title: ${lesson.title}`);
    });
    
    if (lessons.length > 0) {
      console.log(`\nFirst lesson ID: ${lessons[0].id}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getLessons();