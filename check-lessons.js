const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
});

async function checkLessons() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Проверяем уроки в базе данных...\n');
    
    // Проверяем таблицу lessons
    const lessonsResult = await client.query('SELECT id, title, slug FROM lessons LIMIT 10');
    console.log('📚 Уроки в таблице lessons:');
    if (lessonsResult.rows.length === 0) {
      console.log('❌ Нет уроков в таблице lessons');
    } else {
      lessonsResult.rows.forEach(lesson => {
        console.log(`  ID: ${lesson.id}, Title: ${lesson.title}, Slug: ${lesson.slug}`);
      });
    }
    
    console.log('\n📊 Общее количество уроков:', lessonsResult.rows.length);
    
    // Проверяем таблицу Lesson (с заглавной буквы)
    try {
      const LessonResult = await client.query('SELECT id, title, slug FROM "Lesson" LIMIT 10');
      console.log('\n📚 Уроки в таблице "Lesson":');
      if (LessonResult.rows.length === 0) {
        console.log('❌ Нет уроков в таблице "Lesson"');
      } else {
        LessonResult.rows.forEach(lesson => {
          console.log(`  ID: ${lesson.id}, Title: ${lesson.title}, Slug: ${lesson.slug}`);
        });
      }
      console.log('📊 Общее количество уроков в "Lesson":', LessonResult.rows.length);
    } catch (error) {
      console.log('❌ Таблица "Lesson" не существует или недоступна');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

checkLessons().catch(console.error);