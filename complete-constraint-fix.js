const { Pool } = require('pg');
require('dotenv').config();

async function completeConstraintFix() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔧 Complete foreign key constraint fix...\n');

    // 1. Проверяем, какие таблицы существуют
    console.log('📋 Checking existing tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Available tables:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // 2. Проверяем данные в таблицах Lesson и lessons
    console.log('\n📊 Checking data in Lesson tables...');
    
    try {
      const lessonData = await pool.query('SELECT id, title FROM "Lesson" ORDER BY id');
      console.log(`"Lesson" table: ${lessonData.rows.length} records`);
      lessonData.rows.forEach(lesson => {
        console.log(`  ID: ${lesson.id}, Title: ${lesson.title}`);
      });
    } catch (error) {
      console.log(`Error reading "Lesson" table: ${error.message}`);
    }

    try {
      const lessonsData = await pool.query('SELECT id, title FROM lessons ORDER BY id');
      console.log(`lessons table: ${lessonsData.rows.length} records`);
      lessonsData.rows.forEach(lesson => {
        console.log(`  ID: ${lesson.id}, Title: ${lesson.title}`);
      });
    } catch (error) {
      console.log(`Error reading lessons table: ${error.message}`);
    }

    // 3. Удаляем ВСЕ foreign key constraints для проблемных таблиц
    console.log('\n🗑️ Removing ALL foreign key constraints...');
    
    const allConstraints = await pool.query(`
      SELECT constraint_name, table_name
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND (table_name = 'user_favorite_lessons' OR table_name = 'user_lesson_completions')
      ORDER BY table_name, constraint_name;
    `);

    console.log(`Found ${allConstraints.rows.length} constraints to remove:`);
    for (const constraint of allConstraints.rows) {
      console.log(`  - ${constraint.constraint_name} on ${constraint.table_name}`);
      try {
        await pool.query(`ALTER TABLE ${constraint.table_name} DROP CONSTRAINT ${constraint.constraint_name}`);
        console.log(`    ✅ Dropped ${constraint.constraint_name}`);
      } catch (error) {
        console.log(`    ⚠️  Warning: ${error.message}`);
      }
    }

    // 4. Определяем, какую таблицу использовать для lessons
    let lessonTableToUse = '"Lesson"'; // По умолчанию используем Lesson с большой буквы
    
    try {
      const lessonCount = await pool.query('SELECT COUNT(*) FROM "Lesson"');
      const lessonsCount = await pool.query('SELECT COUNT(*) FROM lessons');
      
      console.log(`\n📊 Table comparison:`);
      console.log(`  "Lesson": ${lessonCount.rows[0].count} records`);
      console.log(`  lessons: ${lessonsCount.rows[0].count} records`);
      
      // Используем таблицу с большим количеством записей
      if (parseInt(lessonsCount.rows[0].count) > parseInt(lessonCount.rows[0].count)) {
        lessonTableToUse = 'lessons';
        console.log(`  Using 'lessons' table (more records)`);
      } else {
        console.log(`  Using '"Lesson"' table`);
      }
    } catch (error) {
      console.log(`  Error comparing tables: ${error.message}`);
      console.log(`  Defaulting to "Lesson" table`);
    }

    // 5. Создаём правильные constraints
    console.log('\n✅ Creating correct foreign key constraints...');
    
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
        FOREIGN KEY ("lessonId") REFERENCES ${lessonTableToUse}(id) ON DELETE CASCADE
      `);
      console.log(`    ✅ user_favorite_lessons.lessonId -> ${lessonTableToUse}.id`);
      
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
        FOREIGN KEY ("lessonId") REFERENCES ${lessonTableToUse}(id) ON DELETE CASCADE
      `);
      console.log(`    ✅ user_lesson_completions.lessonId -> ${lessonTableToUse}.id`);
      
    } catch (error) {
      console.log(`    ❌ Error creating constraints for user_lesson_completions: ${error.message}`);
    }

    // 6. Финальная проверка constraints
    console.log('\n📋 Final constraint verification...');
    
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

    console.log('Active foreign key constraints:');
    finalConstraints.rows.forEach(constraint => {
      console.log(`  ✅ ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });

    // 7. Проверяем orphaned records
    console.log('\n🔍 Checking for orphaned records...');
    
    const orphanedFavorites = await pool.query(`
      SELECT uf.* FROM user_favorite_lessons uf
      LEFT JOIN ${lessonTableToUse} l ON uf."lessonId" = l.id
      LEFT JOIN users u ON uf."userId" = u.id
      WHERE l.id IS NULL OR u.id IS NULL
    `);
    
    const orphanedCompletions = await pool.query(`
      SELECT uc.* FROM user_lesson_completions uc
      LEFT JOIN ${lessonTableToUse} l ON uc."lessonId" = l.id
      LEFT JOIN users u ON uc."userId" = u.id
      WHERE l.id IS NULL OR u.id IS NULL
    `);

    console.log(`  Orphaned favorites: ${orphanedFavorites.rows.length}`);
    console.log(`  Orphaned completions: ${orphanedCompletions.rows.length}`);

    if (orphanedFavorites.rows.length > 0) {
      console.log('  Orphaned favorite records:');
      orphanedFavorites.rows.forEach(record => {
        console.log(`    User: ${record.userId}, Lesson: ${record.lessonId}`);
      });
    }

    if (orphanedCompletions.rows.length > 0) {
      console.log('  Orphaned completion records:');
      orphanedCompletions.rows.forEach(record => {
        console.log(`    User: ${record.userId}, Lesson: ${record.lessonId}`);
      });
    }

    // 8. Тестируем constraints
    console.log('\n🧪 Testing constraints...');
    
    // Получаем существующие IDs для тестирования
    const existingUsers = await pool.query('SELECT id FROM users LIMIT 1');
    const existingLessons = await pool.query(`SELECT id FROM ${lessonTableToUse} LIMIT 1`);
    
    if (existingUsers.rows.length > 0 && existingLessons.rows.length > 0) {
      const testUserId = existingUsers.rows[0].id;
      const testLessonId = existingLessons.rows[0].id;
      
      console.log(`  Testing with userId: ${testUserId}, lessonId: ${testLessonId}`);
      
      // Тест 1: Валидная запись
      try {
        await pool.query(`
          INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
          VALUES ($1, $2, NOW())
          ON CONFLICT ("userId", "lessonId") DO NOTHING
        `, [testUserId, testLessonId]);
        console.log('  ✅ Valid record insertion works');
        
        // Удаляем тестовую запись
        await pool.query(`
          DELETE FROM user_favorite_lessons 
          WHERE "userId" = $1 AND "lessonId" = $2
        `, [testUserId, testLessonId]);
      } catch (error) {
        console.log(`  ❌ Valid record insertion failed: ${error.message}`);
      }
      
      // Тест 2: Невалидный userId
      try {
        await pool.query(`
          INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
          VALUES (99999, $1, NOW())
        `, [testLessonId]);
        console.log('  ❌ ERROR: Should have failed with invalid userId');
      } catch (error) {
        if (error.message.includes('violates foreign key constraint')) {
          console.log('  ✅ userId constraint working correctly');
        } else {
          console.log(`  ⚠️  Unexpected error: ${error.message}`);
        }
      }
      
      // Тест 3: Невалидный lessonId
      try {
        await pool.query(`
          INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
          VALUES ($1, 99999, NOW())
        `, [testUserId]);
        console.log('  ❌ ERROR: Should have failed with invalid lessonId');
      } catch (error) {
        if (error.message.includes('violates foreign key constraint')) {
          console.log('  ✅ lessonId constraint working correctly');
        } else {
          console.log(`  ⚠️  Unexpected error: ${error.message}`);
        }
      }
    } else {
      console.log('  ⚠️  Cannot test constraints: no existing users or lessons found');
    }

    console.log('\n🎉 Complete constraint fix finished!');
    console.log(`📊 Summary:`);
    console.log(`  - Using ${lessonTableToUse} table for lesson references`);
    console.log(`  - ${finalConstraints.rows.length} foreign key constraints active`);
    console.log(`  - ${orphanedFavorites.rows.length} orphaned favorites`);
    console.log(`  - ${orphanedCompletions.rows.length} orphaned completions`);

  } catch (error) {
    console.error('❌ Error during complete constraint fix:', error);
  } finally {
    await pool.end();
  }
}

completeConstraintFix();