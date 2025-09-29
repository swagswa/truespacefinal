const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
});

async function seedData() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase database!');

    // Check if data already exists
    const existingThemes = await client.query('SELECT COUNT(*) FROM "Theme"');
    if (parseInt(existingThemes.rows[0].count) > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    console.log('Seeding database with test data...');

    // Insert themes
    const aiThemeResult = await client.query(`
      INSERT INTO "Theme" (slug, title, description, icon, "createdAt", "updatedAt")
      VALUES ('ai-assistants', 'AI Ассистенты', 'Изучение и использование искусственного интеллекта', '🤖', NOW(), NOW())
      RETURNING id
    `);
    const aiThemeId = aiThemeResult.rows[0].id;

    const webThemeResult = await client.query(`
      INSERT INTO "Theme" (slug, title, description, icon, "createdAt", "updatedAt")
      VALUES ('web-development', 'Веб-разработка', 'Современные технологии веб-разработки', '💻', NOW(), NOW())
      RETURNING id
    `);
    const webThemeId = webThemeResult.rows[0].id;

    console.log('✅ Themes created');

    // Insert subtopics for AI theme
    const aiSprintResult = await client.query(`
      INSERT INTO "Subtopic" (slug, title, description, "themeId", "createdAt", "updatedAt")
      VALUES ('sprint-september-2025', 'Спринт сентябрь 2025', 'Интенсивный курс по AI ассистентам', $1, NOW(), NOW())
      RETURNING id
    `, [aiThemeId]);
    const aiSprintId = aiSprintResult.rows[0].id;

    const aiArchiveResult = await client.query(`
      INSERT INTO "Subtopic" (slug, title, description, "themeId", "createdAt", "updatedAt")
      VALUES ('archive', 'Архив', 'Архивные материалы по AI', $1, NOW(), NOW())
      RETURNING id
    `, [aiThemeId]);
    const aiArchiveId = aiArchiveResult.rows[0].id;

    // Insert subtopics for Web theme
    const frontendResult = await client.query(`
      INSERT INTO "Subtopic" (slug, title, description, "themeId", "createdAt", "updatedAt")
      VALUES ('frontend', 'Frontend', 'Разработка пользовательских интерфейсов', $1, NOW(), NOW())
      RETURNING id
    `, [webThemeId]);
    const frontendId = frontendResult.rows[0].id;

    const backendResult = await client.query(`
      INSERT INTO "Subtopic" (slug, title, description, "themeId", "createdAt", "updatedAt")
      VALUES ('backend', 'Backend', 'Серверная разработка', $1, NOW(), NOW())
      RETURNING id
    `, [webThemeId]);
    const backendId = backendResult.rows[0].id;

    console.log('✅ Subtopics created');

    // Insert lessons
    await client.query(`
      INSERT INTO "Lesson" (slug, title, content, "subtopicId", "createdAt", "updatedAt")
      VALUES 
        ('intro-to-ai', 'Введение в AI', 'Подробное введение в мир искусственного интеллекта. В этом уроке мы рассмотрим основные концепции AI, его историю и современные применения.', $1, NOW(), NOW()),
        ('ai-setup', 'Настройка AI ассистента', 'Пошаговое руководство по настройке вашего AI помощника. Узнайте, как правильно конфигурировать и оптимизировать работу AI.', $1, NOW(), NOW()),
        ('ai-history', 'История AI', 'История развития искусственного интеллекта от первых концепций до современных достижений.', $2, NOW(), NOW()),
        ('react-basics', 'React основы', 'Введение в React библиотеку. Изучите компоненты, состояние, пропсы и основы современной фронтенд разработки.', $3, NOW(), NOW()),
        ('nodejs-basics', 'Node.js основы', 'Основы серверной разработки на Node.js. Создание API, работа с базами данных и развертывание приложений.', $4, NOW(), NOW())
    `, [aiSprintId, aiArchiveId, frontendId, backendId]);

    console.log('✅ Lessons created');

    // Create a test user
    await client.query(`
      INSERT INTO "User" (id, email, name, "createdAt", "updatedAt")
      VALUES ('test-user-1', 'test@example.com', 'Тестовый пользователь', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Test user created');

    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await client.end();
  }
}

seedData();