require('dotenv').config();
const { Client } = require('pg');

async function fixForeignKeys() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Проверяем и исправляем внешние ключи...\n');
    
    // Проверяем, существует ли таблица lessons
    const lessonsTableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'lessons'
    `);
    
    console.log('Таблица lessons существует?', lessonsTableCheck.rows.length > 0);
    
    if (lessonsTableCheck.rows.length === 0) {
      console.log('Таблица lessons не существует, удаляем все внешние ключи, ссылающиеся на неё...\n');
      
      // Удаляем все внешние ключи, ссылающиеся на несуществующую таблицу lessons
      console.log('Удаляем user_lesson_completions_lessonId_fkey...');
      await client.query(`
        ALTER TABLE user_lesson_completions 
        DROP CONSTRAINT IF EXISTS user_lesson_completions_lessonId_fkey
      `);
      console.log('✓ Удален user_lesson_completions_lessonId_fkey');
      
      console.log('Удаляем user_favorite_lessons_lessonId_fkey...');
      await client.query(`
        ALTER TABLE user_favorite_lessons 
        DROP CONSTRAINT IF EXISTS user_favorite_lessons_lessonId_fkey
      `);
      console.log('✓ Удален user_favorite_lessons_lessonId_fkey');
    }
    
    // Проверяем, существуют ли правильные внешние ключи
    const correctFKs = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name='user_lesson_completions' OR tc.table_name='user_favorite_lessons')
        AND kcu.column_name = 'lessonId'
        AND ccu.table_name = 'Lesson'
    `);
    
    console.log('\nПравильные внешние ключи (ссылающиеся на Lesson):');
    console.table(correctFKs.rows);
    
    // Если правильных внешних ключей нет, создаём их
    if (correctFKs.rows.length === 0) {
      console.log('\nСоздаём правильные внешние ключи...');
      
      try {
        await client.query(`
          ALTER TABLE user_lesson_completions 
          ADD CONSTRAINT user_lesson_completions_lessonId_fkey 
          FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE
        `);
        console.log('✓ Создан user_lesson_completions_lessonId_fkey -> "Lesson".id');
      } catch (error) {
        console.log('⚠️ Внешний ключ user_lesson_completions_lessonId_fkey уже существует или есть проблема:', error.message);
      }
      
      try {
        await client.query(`
          ALTER TABLE user_favorite_lessons 
          ADD CONSTRAINT user_favorite_lessons_lessonId_fkey 
          FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE
        `);
        console.log('✓ Создан user_favorite_lessons_lessonId_fkey -> "Lesson".id');
      } catch (error) {
        console.log('⚠️ Внешний ключ user_favorite_lessons_lessonId_fkey уже существует или есть проблема:', error.message);
      }
    }
    
    console.log('\n✅ Исправление внешних ключей завершено!');
    
  } catch (error) {
    console.error('Ошибка при исправлении внешних ключей:', error);
  } finally {
    await client.end();
  }
}

fixForeignKeys();