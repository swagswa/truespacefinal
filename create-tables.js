const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
});

async function createTables() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase database!');

    // Check existing tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const existingTables = result.rows.map(row => row.table_name);
    console.log('Existing tables:', existingTables);

    // Create Theme table
    if (!existingTables.includes('Theme')) {
      console.log('Creating Theme table...');
      await client.query(`
        CREATE TABLE "Theme" (
          "id" SERIAL PRIMARY KEY,
          "slug" TEXT UNIQUE NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "icon" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Theme table created');
    }

    // Create Subtopic table
    if (!existingTables.includes('Subtopic')) {
      console.log('Creating Subtopic table...');
      await client.query(`
        CREATE TABLE "Subtopic" (
          "id" SERIAL PRIMARY KEY,
          "slug" TEXT UNIQUE NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "themeId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )
      `);
      console.log('✅ Subtopic table created');
    }

    // Create Lesson table
    if (!existingTables.includes('Lesson')) {
      console.log('Creating Lesson table...');
      await client.query(`
        CREATE TABLE "Lesson" (
          "id" SERIAL PRIMARY KEY,
          "slug" TEXT UNIQUE NOT NULL,
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "subtopicId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        )
      `);
      console.log('✅ Lesson table created');
    }

    // Create User table
    if (!existingTables.includes('User')) {
      console.log('Creating User table...');
      await client.query(`
        CREATE TABLE "User" (
          "id" TEXT PRIMARY KEY,
          "email" TEXT UNIQUE NOT NULL,
          "name" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ User table created');
    }

    // Create UserFavoriteLesson table
    if (!existingTables.includes('UserFavoriteLesson')) {
      console.log('Creating UserFavoriteLesson table...');
      await client.query(`
        CREATE TABLE "UserFavoriteLesson" (
          "id" SERIAL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "lessonId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          UNIQUE("userId", "lessonId")
        )
      `);
      console.log('✅ UserFavoriteLesson table created');
    }

    // Create UserLessonCompletion table
    if (!existingTables.includes('UserLessonCompletion')) {
      console.log('Creating UserLessonCompletion table...');
      await client.query(`
        CREATE TABLE "UserLessonCompletion" (
          "id" SERIAL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "lessonId" INTEGER NOT NULL,
          "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          UNIQUE("userId", "lessonId")
        )
      `);
      console.log('✅ UserLessonCompletion table created');
    }

    console.log('🎉 All tables created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTables();