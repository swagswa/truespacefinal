require('dotenv').config();
const { Client } = require('pg');

async function cleanupForeignKeys() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Удаляем дублирующиеся внешние ключи, которые указывают на пустую таблицу lessons...\n');
    
    // Get all foreign keys that point to the lessons table (empty table)
    const incorrectFKs = await client.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        ccu.table_name AS foreign_table_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name='user_lesson_completions' OR tc.table_name='user_favorite_lessons')
        AND kcu.column_name = 'lessonId'
        AND ccu.table_name = 'lessons';
    `);
    
    console.log('Найдены неправильные внешние ключи, указывающие на пустую таблицу lessons:');
    console.log(incorrectFKs.rows);
    
    // Drop each incorrect foreign key
    for (const fk of incorrectFKs.rows) {
      console.log(`\nУдаляем ${fk.constraint_name} из таблицы ${fk.table_name}...`);
      try {
        await client.query(`
          ALTER TABLE ${fk.table_name} 
          DROP CONSTRAINT ${fk.constraint_name};
        `);
        console.log(`✓ Успешно удален ${fk.constraint_name}`);
      } catch (error) {
        console.log(`⚠️ Ошибка при удалении ${fk.constraint_name}:`, error.message);
      }
    }
    
    console.log('\n--- Финальная проверка ---\n');
    
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
    
    console.log('Финальные внешние ключи для user_lesson_completions (lessonId):');
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
    
    console.log('\nФинальные внешние ключи для user_favorite_lessons (lessonId):');
    console.log(userFavoriteLessonsFKs.rows);
    
    console.log('\n✅ Очистка завершена! Теперь внешние ключи указывают только на таблицу "Lesson" с данными.');
    
  } catch (error) {
    console.error('Ошибка при очистке внешних ключей:', error);
  } finally {
    await client.end();
  }
}

cleanupForeignKeys();