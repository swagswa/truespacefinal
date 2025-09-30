require('dotenv').config();
const { Client } = require('pg');

async function fixForeignKeysFinal() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Исправляем внешние ключи для указания на правильную таблицу "Lesson"...\n');
    
    // Drop the incorrect foreign key from user_lesson_completions
    console.log('1. Удаляем неправильный внешний ключ user_lesson_completions_lessonId_fkey...');
    try {
      await client.query(`
        ALTER TABLE user_lesson_completions 
        DROP CONSTRAINT user_lesson_completions_lessonId_fkey;
      `);
      console.log('✓ Успешно удален');
    } catch (error) {
      console.log('⚠️ Ошибка при удалении:', error.message);
    }
    
    // Drop the incorrect foreign key from user_favorite_lessons
    console.log('\n2. Удаляем неправильный внешний ключ user_favorite_lessons_lessonId_fkey...');
    try {
      await client.query(`
        ALTER TABLE user_favorite_lessons 
        DROP CONSTRAINT user_favorite_lessons_lessonId_fkey;
      `);
      console.log('✓ Успешно удален');
    } catch (error) {
      console.log('⚠️ Ошибка при удалении:', error.message);
    }
    
    // Create correct foreign key for user_lesson_completions
    console.log('\n3. Создаем правильный внешний ключ для user_lesson_completions...');
    try {
      await client.query(`
        ALTER TABLE user_lesson_completions 
        ADD CONSTRAINT user_lesson_completions_lessonId_fkey 
        FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE;
      `);
      console.log('✓ Успешно создан внешний ключ для user_lesson_completions -> "Lesson"');
    } catch (error) {
      console.log('⚠️ Ошибка при создании:', error.message);
    }
    
    // Create correct foreign key for user_favorite_lessons
    console.log('\n4. Создаем правильный внешний ключ для user_favorite_lessons...');
    try {
      await client.query(`
        ALTER TABLE user_favorite_lessons 
        ADD CONSTRAINT user_favorite_lessons_lessonId_fkey 
        FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE;
      `);
      console.log('✓ Успешно создан внешний ключ для user_favorite_lessons -> "Lesson"');
    } catch (error) {
      console.log('⚠️ Ошибка при создании:', error.message);
    }
    
    console.log('\n--- Проверяем результат ---\n');
    
    // Check final foreign keys for user_lesson_completions
    const userLessonCompletionsFKs = await client.query(`
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
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='user_lesson_completions'
        AND kcu.column_name = 'lessonId';
    `);
    
    console.log('Внешние ключи для user_lesson_completions (lessonId):');
    console.log(userLessonCompletionsFKs.rows);
    
    // Check final foreign keys for user_favorite_lessons
    const userFavoriteLessonsFKs = await client.query(`
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
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='user_favorite_lessons'
        AND kcu.column_name = 'lessonId';
    `);
    
    console.log('\nВнешние ключи для user_favorite_lessons (lessonId):');
    console.log(userFavoriteLessonsFKs.rows);
    
    console.log('\n✅ Исправление внешних ключей завершено!');
    console.log('Теперь внешние ключи указывают на таблицу "Lesson" с данными.');
    
  } catch (error) {
    console.error('Ошибка при исправлении внешних ключей:', error);
  } finally {
    await client.end();
  }
}

fixForeignKeysFinal();