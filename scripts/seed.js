const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
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
              slug: 'sprint-september-2025',
              title: 'Спринт сентябрь 2025',
              description: 'Интенсивный курс по AI ассистентам',
              lessons: {
                create: [
                  {
                    title: 'Введение в AI',
                    description: 'Основы искусственного интеллекта',
                    content: 'Подробное введение в мир AI...',
                    duration: 30,
                  },
                  {
                    title: 'Настройка AI ассистента',
                    description: 'Как настроить своего AI помощника',
                    content: 'Пошаговое руководство по настройке...',
                    duration: 45,
                  },
                ],
              },
            },
            {
              slug: 'archive',
              title: 'Архив',
              description: 'Архивные материалы по AI',
              lessons: {
                create: [
                  {
                    title: 'История AI',
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
              slug: 'frontend',
              title: 'Frontend',
              description: 'Разработка пользовательских интерфейсов',
              lessons: {
                create: [
                  {
                    title: 'React основы',
                    description: 'Изучение основ React',
                    content: 'Введение в React библиотеку...',
                    duration: 60,
                  },
                ],
              },
            },
            {
              slug: 'backend',
              title: 'Backend',
              description: 'Серверная разработка',
              lessons: {
                create: [
                  {
                    title: 'Node.js основы',
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
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });