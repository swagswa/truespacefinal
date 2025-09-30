require('dotenv').config();
const { Client } = require('pg');

async function dropIncorrectForeignKeys() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Удаляем неправильные внешние ключи, которые ссылаются на таблицу lessons...\n');
    
    // Drop the incorrect foreign key from user_lesson_completions
    console.log('Удаляем user_lesson_completions_lessonId_fkey (ссылается на lessons)...');
    try {
      await client.query(`
        ALTER TABLE user_lesson_completions 
        DROP CONSTRAINT user_lesson_completions_lessonId_fkey;
      `);
      console.log('✓ Успешно удален user_lesson_completions_lessonId_fkey');
    } catch (error) {
      console.log('⚠️ Ошибка при удалении user_lesson_completions_lessonId_fkey:', error.message);
    }
    
    // Drop the incorrect foreign key from user_favorite_lessons
    console.log('\nУдаляем user_favorite_lessons_lessonId_fkey (ссылается на lessons)...');
    try {
      await client.query(`
        ALTER TABLE user_favorite_lessons 
        DROP CONSTRAINT user_favorite_lessons_lessonId_fkey;
      `);
      console.log('✓ Успешно удален user_favorite_lessons_lessonId_fkey');
    } catch (error) {
      console.log('⚠️ Ошибка при удалении user_favorite_lessons_lessonId_fkey:', error.message);
    }
    
    console.log('\n--- Проверяем оставшиеся внешние ключи ---\n');
    
    // Check remaining foreign keys for user_lesson_completions
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
    
    console.log('Оставшиеся внешние ключи для user_lesson_completions (lessonId):');
    console.log(userLessonCompletionsFKs.rows);
    
    // Check remaining foreign keys for user_favorite_lessons
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
    
    console.log('\nОставшиеся внешние ключи для user_favorite_lessons (lessonId):');
    console.log(userFavoriteLessonsFKs.rows);
    
    console.log('\n✅ Операция завершена!');
    
  } catch (error) {
    console.error('Ошибка при удалении неправильных внешних ключей:', error);
  } finally {
    await client.end();
  }
}

dropIncorrectForeignKeys();