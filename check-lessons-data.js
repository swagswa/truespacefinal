require('dotenv').config();
const { Client } = require('pg');

async function checkLessonsData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Проверяем данные в таблицах уроков...\n');
    
    // Check if "Lesson" table exists and its data
    console.log('=== Проверяем таблицу "Lesson" (с кавычками) ===');
    try {
      const lessonTableData = await client.query('SELECT id, title FROM "Lesson" ORDER BY id LIMIT 10;');
      console.log(`Найдено ${lessonTableData.rows.length} записей в таблице "Lesson":`);
      console.log(lessonTableData.rows);
    } catch (error) {
      console.log('Ошибка при запросе к таблице "Lesson":', error.message);
    }
    
    // Check if lessons table exists and its data
    console.log('\n=== Проверяем таблицу lessons (без кавычек) ===');
    try {
      const lessonsTableData = await client.query('SELECT id, title FROM lessons ORDER BY id LIMIT 10;');
      console.log(`Найдено ${lessonsTableData.rows.length} записей в таблице lessons:`);
      console.log(lessonsTableData.rows);
    } catch (error) {
      console.log('Ошибка при запросе к таблице lessons:', error.message);
    }
    
    // Check table structures
    console.log('\n=== Структуры таблиц ===');
    
    // Check "Lesson" table structure
    try {
      const lessonStructure = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'Lesson' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      console.log('\nСтруктура таблицы "Lesson":');
      console.log(lessonStructure.rows);
    } catch (error) {
      console.log('Ошибка при получении структуры "Lesson":', error.message);
    }
    
    // Check lessons table structure
    try {
      const lessonsStructure = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'lessons' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      console.log('\nСтруктура таблицы lessons:');
      console.log(lessonsStructure.rows);
    } catch (error) {
      console.log('Ошибка при получении структуры lessons:', error.message);
    }
    
  } catch (error) {
    console.error('Ошибка при проверке данных уроков:', error);
  } finally {
    await client.end();
  }
}

checkLessonsData();