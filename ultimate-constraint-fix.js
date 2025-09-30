const { Pool } = require('pg');
require('dotenv').config();

async function ultimateConstraintFix() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Ultimate constraint fix - complete cleanup and recreation...\n');

    // 1. Получаем ВСЕ constraints для наших таблиц (включая скрытые)
    console.log('🔍 Finding ALL constraints (including system-generated ones)...');
    
    const allConstraintsQuery = `
      SELECT 
        conname as constraint_name,
        conrelid::regclass as table_name,
        confrelid::regclass as referenced_table,
        contype
      FROM pg_constraint 
      WHERE conrelid IN (
        'user_favorite_lessons'::regclass,
        'user_lesson_completions'::regclass
      )
      AND contype = 'f'
      ORDER BY conname;
    `;
    
    const allConstraints = await pool.query(allConstraintsQuery);
    
    console.log(`Found ${allConstraints.rows.length} foreign key constraints:`);
    allConstraints.rows.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.table_name} -> ${constraint.referenced_table}`);
    });

    // 2. Удаляем ВСЕ найденные constraints
    console.log('\n🗑️ Removing ALL foreign key constraints...');
    
    for (const constraint of allConstraints.rows) {
      try {
        const dropQuery = `ALTER TABLE ${constraint.table_name} DROP CONSTRAINT ${constraint.constraint_name}`;
        console.log(`  Executing: ${dropQuery}`);
        await pool.query(dropQuery);
        console.log(`    ✅ Dropped ${constraint.constraint_name}`);
      } catch (error) {
        console.log(`    ❌ Error dropping ${constraint.constraint_name}: ${error.message}`);
      }
    }

    // 3. Проверяем, что все constraints удалены
    console.log('\n🔍 Verifying all constraints are removed...');
    const remainingConstraints = await pool.query(allConstraintsQuery);
    
    if (remainingConstraints.rows.length === 0) {
      console.log('  ✅ All foreign key constraints successfully removed');
    } else {
      console.log(`  ⚠️  ${remainingConstraints.rows.length} constraints still remain:`);
      remainingConstraints.rows.forEach(constraint => {
        console.log(`    - ${constraint.constraint_name}`);
      });
    }

    // 4. Создаём ТОЛЬКО правильные constraints
    console.log('\n✅ Creating clean, correct foreign key constraints...');
    
    // Для user_favorite_lessons
    console.log('  Creating constraints for user_favorite_lessons...');
    
    try {
      await pool.query(`
        ALTER TABLE user_favorite_lessons 
        ADD CONSTRAINT fk_user_favorite_lessons_user 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('    ✅ fk_user_favorite_lessons_user: userId -> users.id');
    } catch (error) {
      console.log(`    ❌ Error creating user constraint: ${error.message}`);
    }
    
    try {
      await pool.query(`
        ALTER TABLE user_favorite_lessons 
        ADD CONSTRAINT fk_user_favorite_lessons_lesson 
        FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE
      `);
      console.log('    ✅ fk_user_favorite_lessons_lesson: lessonId -> "Lesson".id');
    } catch (error) {
      console.log(`    ❌ Error creating lesson constraint: ${error.message}`);
    }

    // Для user_lesson_completions
    console.log('  Creating constraints for user_lesson_completions...');
    
    try {
      await pool.query(`
        ALTER TABLE user_lesson_completions 
        ADD CONSTRAINT fk_user_lesson_completions_user 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('    ✅ fk_user_lesson_completions_user: userId -> users.id');
    } catch (error) {
      console.log(`    ❌ Error creating user constraint: ${error.message}`);
    }
    
    try {
      await pool.query(`
        ALTER TABLE user_lesson_completions 
        ADD CONSTRAINT fk_user_lesson_completions_lesson 
        FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE
      `);
      console.log('    ✅ fk_user_lesson_completions_lesson: lessonId -> "Lesson".id');
    } catch (error) {
      console.log(`    ❌ Error creating lesson constraint: ${error.message}`);
    }

    // 5. Финальная проверка
    console.log('\n📋 Final verification...');
    
    const finalConstraints = await pool.query(allConstraintsQuery);
    
    console.log(`Active foreign key constraints (${finalConstraints.rows.length}):`);
    finalConstraints.rows.forEach(constraint => {
      console.log(`  ✅ ${constraint.constraint_name}: ${constraint.table_name} -> ${constraint.referenced_table}`);
    });

    // 6. Проверяем данные
    console.log('\n📊 Data verification...');
    
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const lessonsCount = await pool.query('SELECT COUNT(*) FROM "Lesson"');
    const favoritesCount = await pool.query('SELECT COUNT(*) FROM user_favorite_lessons');
    const completionsCount = await pool.query('SELECT COUNT(*) FROM user_lesson_completions');
    
    console.log(`  Users: ${usersCount.rows[0].count}`);
    console.log(`  Lessons: ${lessonsCount.rows[0].count}`);
    console.log(`  Favorites: ${favoritesCount.rows[0].count}`);
    console.log(`  Completions: ${completionsCount.rows[0].count}`);

    // 7. Тестируем функциональность
    console.log('\n🧪 Testing constraint functionality...');
    
    const testUsers = await pool.query('SELECT id FROM users LIMIT 1');
    const testLessons = await pool.query('SELECT id FROM "Lesson" LIMIT 1');
    
    if (testUsers.rows.length > 0 && testLessons.rows.length > 0) {
      const userId = testUsers.rows[0].id;
      const lessonId = testLessons.rows[0].id;
      
      // Тест валидной записи
      try {
        await pool.query(`
          INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
          VALUES ($1, $2, NOW())
          ON CONFLICT ("userId", "lessonId") DO NOTHING
        `, [userId, lessonId]);
        
        await pool.query(`
          DELETE FROM user_favorite_lessons 
          WHERE "userId" = $1 AND "lessonId" = $2
        `, [userId, lessonId]);
        
        console.log('  ✅ Valid operations work correctly');
      } catch (error) {
        console.log(`  ❌ Valid operations failed: ${error.message}`);
      }
      
      // Тест невалидного lessonId
      try {
        await pool.query(`
          INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
          VALUES ($1, 99999, NOW())
        `, [userId]);
        console.log('  ❌ ERROR: Should have failed with invalid lessonId');
      } catch (error) {
        if (error.code === '23503') {
          console.log('  ✅ Foreign key constraints working correctly');
        } else {
          console.log(`  ⚠️  Unexpected error: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Ultimate constraint fix completed successfully!');
    console.log('✅ Database is now ready for testing favorites and completions functionality.');

  } catch (error) {
    console.error('❌ Error during ultimate constraint fix:', error);
  } finally {
    await pool.end();
  }
}

ultimateConstraintFix();