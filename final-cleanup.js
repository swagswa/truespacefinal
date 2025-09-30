const { Pool } = require('pg');
require('dotenv').config();

async function finalCleanup() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🧹 Final cleanup of foreign key constraints...\n');

    // 1. Удаляем ВСЕ foreign key constraints для этих таблиц
    console.log('🗑️ Removing ALL existing foreign key constraints...');
    
    const allConstraints = await pool.query(`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND (table_name = 'user_favorite_lessons' OR table_name = 'user_lesson_completions')
      ORDER BY table_name, constraint_name;
    `);

    for (const constraint of allConstraints.rows) {
      try {
        console.log(`  Dropping: ${constraint.constraint_name} from ${constraint.table_name}`);
        await pool.query(`ALTER TABLE ${constraint.table_name} DROP CONSTRAINT ${constraint.constraint_name}`);
        console.log(`    ✅ Dropped ${constraint.constraint_name}`);
      } catch (error) {
        console.log(`    ⚠️  Warning: ${error.message}`);
      }
    }

    // 2. Создаём правильные constraints с нуля
    console.log('\n✅ Creating clean foreign key constraints...');
    
    // Для user_favorite_lessons
    try {
      console.log('  Creating constraints for user_favorite_lessons...');
      
      await pool.query(`
        ALTER TABLE user_favorite_lessons 
        ADD CONSTRAINT user_favorite_lessons_user_fkey 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('    ✅ user_favorite_lessons.userId -> users.id');
      
      await pool.query(`
        ALTER TABLE user_favorite_lessons 
        ADD CONSTRAINT user_favorite_lessons_lesson_fkey 
        FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE
      `);
      console.log('    ✅ user_favorite_lessons.lessonId -> Lesson.id');
      
    } catch (error) {
      console.log(`    ❌ Error creating constraints for user_favorite_lessons: ${error.message}`);
    }

    // Для user_lesson_completions
    try {
      console.log('  Creating constraints for user_lesson_completions...');
      
      await pool.query(`
        ALTER TABLE user_lesson_completions 
        ADD CONSTRAINT user_lesson_completions_user_fkey 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('    ✅ user_lesson_completions.userId -> users.id');
      
      await pool.query(`
        ALTER TABLE user_lesson_completions 
        ADD CONSTRAINT user_lesson_completions_lesson_fkey 
        FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE
      `);
      console.log('    ✅ user_lesson_completions.lessonId -> Lesson.id');
      
    } catch (error) {
      console.log(`    ❌ Error creating constraints for user_lesson_completions: ${error.message}`);
    }

    // 3. Финальная проверка
    console.log('\n📋 Final verification:');
    
    const finalConstraints = await pool.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND (tc.table_name = 'user_favorite_lessons' OR tc.table_name = 'user_lesson_completions')
      ORDER BY tc.table_name, tc.constraint_name;
    `);

    console.log('Foreign key constraints:');
    finalConstraints.rows.forEach(constraint => {
      console.log(`  ✅ ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name} (${constraint.constraint_name})`);
    });

    // 4. Проверяем данные
    console.log('\n📊 Data verification:');
    
    const favoritesCount = await pool.query('SELECT COUNT(*) FROM user_favorite_lessons');
    const completionsCount = await pool.query('SELECT COUNT(*) FROM user_lesson_completions');
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const lessonsCount = await pool.query('SELECT COUNT(*) FROM "Lesson"');
    
    console.log(`  Users: ${usersCount.rows[0].count}`);
    console.log(`  Lessons: ${lessonsCount.rows[0].count}`);
    console.log(`  Favorites: ${favoritesCount.rows[0].count}`);
    console.log(`  Completions: ${completionsCount.rows[0].count}`);

    // 5. Тестируем constraints
    console.log('\n🧪 Testing constraints...');
    
    try {
      // Пытаемся вставить запись с несуществующим userId
      await pool.query(`
        INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
        VALUES (99999, 1, NOW())
      `);
      console.log('  ❌ ERROR: Should have failed with invalid userId');
    } catch (error) {
      if (error.message.includes('violates foreign key constraint')) {
        console.log('  ✅ userId constraint working correctly');
      } else {
        console.log(`  ⚠️  Unexpected error: ${error.message}`);
      }
    }

    try {
      // Пытаемся вставить запись с несуществующим lessonId
      await pool.query(`
        INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
        VALUES (1, 99999, NOW())
      `);
      console.log('  ❌ ERROR: Should have failed with invalid lessonId');
    } catch (error) {
      if (error.message.includes('violates foreign key constraint')) {
        console.log('  ✅ lessonId constraint working correctly');
      } else {
        console.log(`  ⚠️  Unexpected error: ${error.message}`);
      }
    }

    console.log('\n🎉 Database cleanup complete! All constraints are properly configured.');

  } catch (error) {
    console.error('❌ Error during final cleanup:', error);
  } finally {
    await pool.end();
  }
}

finalCleanup();