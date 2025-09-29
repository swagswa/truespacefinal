import { PrismaClient } from '@prisma/client';

// Global variable to store Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// In development, store the client on the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database connection helper
export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    return false;
  }
}

// Database disconnection helper
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Disconnected from database');
    return true;
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
    return false;
  }
}

// Health check helper
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', message: 'Database is healthy' };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'error', message: 'Database is not responding' };
  }
}

// Seed data helper
export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingThemes = await prisma.theme.count();
    if (existingThemes > 0) {
      console.log('Database already seeded');
      return;
    }

    // Create sample themes
    const aiTheme = await prisma.theme.create({
      data: {
        slug: 'ai-assistants',
        title: 'AI Ассистенты',
        description: 'Изучение и использование искусственного интеллекта',
        icon: '🤖',
        subtopics: {
          create: [
            {
              title: 'Спринт сентябрь 2025',
              slug: 'sprint-sentyabr-2025',
              description: 'Интенсивный курс по AI ассистентам',
              lessons: {
                create: [
                  {
                    title: 'Введение в AI',
                    slug: 'vvedenie-v-ai',
                    description: 'Основы искусственного интеллекта',
                    content: 'Подробное введение в мир AI...',
                    duration: 30,
                  },
                  {
                    title: 'Настройка AI ассистента',
                    slug: 'nastroyka-ai-assistenta',
                    description: 'Как настроить своего AI помощника',
                    content: 'Пошаговое руководство по настройке...',
                    duration: 45,
                  },
                ],
              },
            },
            {
              title: 'Архив',
              slug: 'arhiv',
              description: 'Архивные материалы по AI',
              lessons: {
                create: [
                  {
                    title: 'История AI',
                    slug: 'istoriya-ai',
                    description: 'Развитие искусственного интеллекта',
                    content: 'История развития AI технологий...',
                    duration: 25,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    const webTheme = await prisma.theme.create({
      data: {
        slug: 'web-development',
        title: 'Веб-разработка',
        description: 'Современные технологии веб-разработки',
        icon: '💻',
        subtopics: {
          create: [
            {
              title: 'Frontend',
              slug: 'frontend',
              description: 'Разработка пользовательских интерфейсов',
              lessons: {
                create: [
                  {
                    title: 'React основы',
                    slug: 'react-osnovy',
                    description: 'Изучение основ React',
                    content: 'Введение в React библиотеку...',
                    duration: 60,
                  },
                ],
              },
            },
            {
              title: 'Backend',
              slug: 'backend',
              description: 'Серверная разработка',
              lessons: {
                create: [
                  {
                    title: 'Node.js основы',
                    slug: 'nodejs-osnovy',
                    description: 'Изучение Node.js',
                    content: 'Основы серверной разработки на Node.js...',
                    duration: 50,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    console.log('✅ Database seeded successfully');
    return { aiTheme, webTheme };
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}