const { Client } = require('pg');
require('dotenv').config();

async function checkDatabaseStructure() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('🔍 Проверка структуры базы данных...\n');

    // Проверяем существующие таблицы
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('lessons', 'Lesson', 'user_lesson_completions', 'user_favorite_lessons')
      ORDER BY table_name
    `);
    
    console.log('📋 Существующие таблицы:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log();

    // Проверяем внешние ключи
    const foreignKeysResult = await client.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name IN ('user_lesson_completions', 'user_favorite_lessons')
      ORDER BY tc.table_name, kcu.column_name
    `);

    console.log('🔗 Внешние ключи:');
    foreignKeysResult.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name} (${row.constraint_name})`);
    });
    console.log();

    // Проверяем количество записей в каждой таблице
    for (const tableName of ['lessons', '"Lesson"', 'user_lesson_completions', 'user_favorite_lessons']) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
        console.log(`📊 ${tableName}: ${countResult.rows[0].count} записей`);
      } catch (error) {
        console.log(`❌ ${tableName}: таблица не существует или ошибка доступа`);
      }
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabaseStructure();