require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function fixTables() {
  try {
    await client.connect();
    console.log('Connected to Supabase database');

    // Drop old tables if they exist
    console.log('Dropping old tables...');
    await client.query('DROP TABLE IF EXISTS "UserLessonCompletion" CASCADE');
    await client.query('DROP TABLE IF EXISTS "UserFavoriteLesson" CASCADE');
    await client.query('DROP TABLE IF EXISTS "User" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Lesson" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Subtopic" CASCADE');
    await client.query('DROP TABLE IF EXISTS "Theme" CASCADE');
    console.log('✅ Old tables dropped');

    // Create themes table
    console.log('Creating themes table...');
    await client.query(`
      CREATE TABLE themes (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subtopics table
    console.log('Creating subtopics table...');
    await client.query(`
      CREATE TABLE subtopics (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        "themeId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("themeId") REFERENCES themes(id) ON DELETE CASCADE
      )
    `);

    // Create lessons table
    console.log('Creating lessons table...');
    await client.query(`
      CREATE TABLE lessons (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        duration INTEGER NOT NULL DEFAULT 0,
        "subtopicId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("subtopicId") REFERENCES subtopics(id) ON DELETE CASCADE
      )
    `);

    // Create users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        "sessionId" TEXT UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "firstName" TEXT,
        "isPremium" BOOLEAN DEFAULT false,
        "languageCode" TEXT,
        "lastName" TEXT,
        "photoUrl" TEXT,
        "telegramId" TEXT UNIQUE,
        username TEXT
      )
    `);

    // Create user_favorite_lessons table
    console.log('Creating user_favorite_lessons table...');
    await client.query(`
      CREATE TABLE user_favorite_lessons (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "lessonId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY ("lessonId") REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE("userId", "lessonId")
      )
    `);

    // Create user_lesson_completions table
    console.log('Creating user_lesson_completions table...');
    await client.query(`
      CREATE TABLE user_lesson_completions (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "lessonId" INTEGER NOT NULL,
        "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY ("lessonId") REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE("userId", "lessonId")
      )
    `);

    console.log('✅ All tables created successfully with correct names and structure!');

  } catch (error) {
    console.error('❌ Error fixing tables:', error);
  } finally {
    await client.end();
  }
}

fixTables();