const { PrismaClient } = require('@prisma/client');

async function getLessonId() {
  const prisma = new PrismaClient();
  try {
    const lesson = await prisma.lesson.findFirst();
    console.log('Lesson ID:', lesson?.id);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getLessonId();