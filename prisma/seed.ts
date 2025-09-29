import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.lesson.deleteMany();
  await prisma.subtopic.deleteMany();
  await prisma.theme.deleteMany();

  // Create themes
  const mathTheme = await prisma.theme.create({
    data: {
      slug: 'mathematics',
      title: 'Математика',
      description: 'Основы математики и алгебры',
      icon: '📊',
    },
  });

  const physicsTheme = await prisma.theme.create({
    data: {
      slug: 'physics',
      title: 'Физика',
      description: 'Основы физики и механики',
      icon: '⚛️',
    },
  });

  const chemistryTheme = await prisma.theme.create({
    data: {
      slug: 'chemistry',
      title: 'Химия',
      description: 'Основы химии и химических реакций',
      icon: '🧪',
    },
  });

  // Create subtopics for Mathematics
  const algebraSubtopic = await prisma.subtopic.create({
    data: {
      title: 'Алгебра',
      slug: 'algebra',
      description: 'Основы алгебры и линейных уравнений',
      themeId: mathTheme.id,
    },
  });

  const geometrySubtopic = await prisma.subtopic.create({
    data: {
      title: 'Геометрия',
      slug: 'geometry',
      description: 'Планиметрия и стереометрия',
      themeId: mathTheme.id,
    },
  });

  // Create subtopics for Physics
  const mechanicsSubtopic = await prisma.subtopic.create({
    data: {
      title: 'Механика',
      slug: 'mechanics',
      description: 'Кинематика и динамика',
      themeId: physicsTheme.id,
    },
  });

  const thermodynamicsSubtopic = await prisma.subtopic.create({
    data: {
      title: 'Термодинамика',
      slug: 'thermodynamics',
      description: 'Тепловые процессы и энергия',
      themeId: physicsTheme.id,
    },
  });

  // Create subtopics for Chemistry
  const organicSubtopic = await prisma.subtopic.create({
    data: {
      title: 'Органическая химия',
      slug: 'organic-chemistry',
      description: 'Углеводороды и их производные',
      themeId: chemistryTheme.id,
    },
  });

  const inorganicSubtopic = await prisma.subtopic.create({
    data: {
      title: 'Неорганическая химия',
      slug: 'inorganic-chemistry',
      description: 'Металлы и неметаллы',
      themeId: chemistryTheme.id,
    },
  });

  // Create lessons for Algebra
  await prisma.lesson.createMany({
    data: [
      {
        title: 'Введение в алгебру',
        slug: 'vvedenie-v-algebru',
        description: 'Основы алгебраических понятий',
        content: 'Основные понятия алгебры: переменные, выражения, уравнения',
        duration: 30,
        subtopicId: algebraSubtopic.id,
      },
      {
        title: 'Линейные уравнения',
        slug: 'linejnye-uravneniya',
        description: 'Решение уравнений первой степени',
        content: 'Решение линейных уравнений с одной переменной',
        duration: 45,
        subtopicId: algebraSubtopic.id,
      },
      {
        title: 'Системы уравнений',
        slug: 'sistemy-uravnenij',
        description: 'Методы решения систем',
        content: 'Методы решения систем линейных уравнений',
        duration: 60,
        subtopicId: algebraSubtopic.id,
      },
    ],
  });

  // Create lessons for Geometry
  await prisma.lesson.createMany({
    data: [
      {
        title: 'Основы планиметрии',
        slug: 'osnovy-planimetrii',
        description: 'Изучение плоских фигур',
        content: 'Точки, прямые, углы и их свойства',
        duration: 40,
        subtopicId: geometrySubtopic.id,
      },
      {
        title: 'Треугольники',
        slug: 'treugolniki',
        description: 'Свойства треугольников',
        content: 'Виды треугольников и их свойства',
        duration: 50,
        subtopicId: geometrySubtopic.id,
      },
    ],
  });

  // Create lessons for Mechanics
  await prisma.lesson.createMany({
    data: [
      {
        title: 'Законы Ньютона',
        slug: 'zakony-nyutona',
        description: 'Основы классической механики',
        content: 'Три закона механики Ньютона и их применение',
        duration: 40,
        subtopicId: mechanicsSubtopic.id,
      },
      {
        title: 'Кинематика',
        slug: 'kinematika',
        description: 'Описание движения',
        content: 'Описание движения тел в пространстве и времени',
        duration: 35,
        subtopicId: mechanicsSubtopic.id,
      },
    ],
  });

  // Create lessons for Thermodynamics
  await prisma.lesson.createMany({
    data: [
      {
        title: 'Первый закон термодинамики',
        slug: 'pervyy-zakon-termodinamiki',
        description: 'Закон сохранения энергии',
        content: 'Закон сохранения энергии в тепловых процессах',
        duration: 45,
        subtopicId: thermodynamicsSubtopic.id,
      },
    ],
  });

  // Create lessons for Organic Chemistry
  await prisma.lesson.createMany({
    data: [
      {
        title: 'Углеводороды',
        slug: 'uglevodorody',
        description: 'Основные органические соединения',
        content: 'Алканы, алкены, алкины и их свойства',
        duration: 50,
        subtopicId: organicSubtopic.id,
      },
      {
        title: 'Функциональные группы',
        slug: 'funkcionalnye-gruppy',
        description: 'Группы атомов в органических молекулах',
        content: 'Спирты, альдегиды, кетоны, кислоты',
        duration: 55,
        subtopicId: organicSubtopic.id,
      },
    ],
  });

  // Create lessons for Inorganic Chemistry
  await prisma.lesson.createMany({
    data: [
      {
        title: 'Периодическая таблица',
        slug: 'periodicheskaya-tablica',
        description: 'Система химических элементов',
        content: 'Изучение периодической таблицы элементов',
        duration: 35,
        subtopicId: inorganicSubtopic.id,
      },
      {
        title: 'Химические связи',
        slug: 'himicheskie-svyazi',
        description: 'Типы связей между атомами',
        content: 'Ионная, ковалентная и металлическая связи',
        duration: 40,
        subtopicId: inorganicSubtopic.id,
      },
    ],
  });

  console.log('Seeding completed!');
  console.log(`Created ${await prisma.theme.count()} themes`);
  console.log(`Created ${await prisma.subtopic.count()} subtopics`);
  console.log(`Created ${await prisma.lesson.count()} lessons`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });