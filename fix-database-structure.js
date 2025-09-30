const { Pool } = require('pg');
require('dotenv').config();

async function fixDatabaseStructure() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔧 Fixing database structure...\n');

    // 1. Сначала проверим текущие foreign key constraints
    console.log('📋 Current foreign key constraints:');
    const currentConstraints = await pool.query(`
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
    
    currentConstraints.rows.forEach(constraint => {
      console.log(`  ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });

    // 2. Удаляем старые foreign key constraints, которые ссылаются на неправильные таблицы
    console.log('\n🗑️ Dropping incorrect foreign key constraints...');
    
    const constraintsToFix = currentConstraints.rows.filter(c => 
      (c.foreign_table_name === 'lessons' && c.column_name === 'lessonId') ||
      (c.foreign_table_name === 'users' && c.column_name === 'userId')
    );

    for (const constraint of constraintsToFix) {
      try {
        console.log(`  Dropping constraint: ${constraint.constraint_name} from ${constraint.table_name}`);
        await pool.query(`ALTER TABLE ${constraint.table_name} DROP CONSTRAINT IF EXISTS ${constraint.constraint_name}`);
      } catch (error) {
        console.log(`    Warning: Could not drop ${constraint.constraint_name}: ${error.message}`);
      }
    }

    // 3. Создаем правильные foreign key constraints
    console.log('\n✅ Creating correct foreign key constraints...');
    
    // Для user_favorite_lessons
    try {
      console.log('  Creating FK: user_favorite_lessons.lessonId -> "Lesson".id');
      await pool.query(`
        ALTER TABLE user_favorite_lessons 
        ADD CONSTRAINT user_favorite_lessons_lessonId_fkey 
        FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE
      `);
    } catch (error) {
      console.log(`    Warning: ${error.message}`);
    }

    try {
      console.log('  Creating FK: user_favorite_lessons.userId -> users.id');
      await pool.query(`
        ALTER TABLE user_favorite_lessons 
        ADD CONSTRAINT user_favorite_lessons_userId_fkey 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `);
    } catch (error) {
      console.log(`    Warning: ${error.message}`);
    }

    // Для user_lesson_completions
    try {
      console.log('  Creating FK: user_lesson_completions.lessonId -> "Lesson".id');
      await pool.query(`
        ALTER TABLE user_lesson_completions 
        ADD CONSTRAINT user_lesson_completions_lessonId_fkey 
        FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE
      `);
    } catch (error) {
      console.log(`    Warning: ${error.message}`);
    }

    try {
      console.log('  Creating FK: user_lesson_completions.userId -> users.id');
      await pool.query(`
        ALTER TABLE user_lesson_completions 
        ADD CONSTRAINT user_lesson_completions_userId_fkey 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `);
    } catch (error) {
      console.log(`    Warning: ${error.message}`);
    }

    // 4. Проверяем, можно ли безопасно удалить ненужные таблицы
    console.log('\n🔍 Checking if uppercase tables can be safely removed...');
    
    const tablesToCheck = ['User', 'UserFavoriteLesson', 'UserLessonCompletion'];
    
    for (const tableName of tablesToCheck) {
      try {
        // Проверяем, есть ли данные в таблице
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const recordCount = parseInt(countResult.rows[0].count);
        
        console.log(`  Table "${tableName}": ${recordCount} records`);
        
        if (recordCount === 0) {
          console.log(`    ✅ Safe to remove "${tableName}" (empty)`);
        } else {
          console.log(`    ⚠️  "${tableName}" has data, review before removal`);
        }
      } catch (error) {
        console.log(`    ❌ Error checking "${tableName}": ${error.message}`);
      }
    }

    // 5. Удаляем пустые ненужные таблицы (только если они пустые)
    console.log('\n🗑️ Removing empty unnecessary tables...');
    
    for (const tableName of tablesToCheck) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const recordCount = parseInt(countResult.rows[0].count);
        
        if (recordCount === 0) {
          console.log(`  Dropping empty table "${tableName}"`);
          await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
          console.log(`    ✅ Dropped "${tableName}"`);
        } else {
          console.log(`    ⚠️  Skipping "${tableName}" - has ${recordCount} records`);
        }
      } catch (error) {
        console.log(`    ❌ Error dropping "${tableName}": ${error.message}`);
      }
    }

    // 6. Проверяем итоговые foreign key constraints
    console.log('\n📋 Final foreign key constraints:');
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
    
    finalConstraints.rows.forEach(constraint => {
      console.log(`  ✅ ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });

    // 7. Проверяем orphaned записи после исправления
    console.log('\n🔍 Checking for orphaned records after fixes:');
    
    try {
      const orphanedFavorites = await pool.query(`
        SELECT uf.* 
        FROM user_favorite_lessons uf
        LEFT JOIN "Lesson" l ON uf."lessonId" = l.id
        WHERE l.id IS NULL;
      `);
      
      if (orphanedFavorites.rows.length > 0) {
        console.log(`  ❌ Found ${orphanedFavorites.rows.length} orphaned favorite records`);
        orphanedFavorites.rows.forEach(orphan => {
          console.log(`    User: ${orphan.userId}, Missing Lesson ID: ${orphan.lessonId}`);
        });
      } else {
        console.log('  ✅ No orphaned favorite records');
      }
    } catch (error) {
      console.log(`  Error checking favorites: ${error.message}`);
    }

    try {
      const orphanedCompletions = await pool.query(`
        SELECT uc.* 
        FROM user_lesson_completions uc
        LEFT JOIN "Lesson" l ON uc."lessonId" = l.id
        WHERE l.id IS NULL;
      `);
      
      if (orphanedCompletions.rows.length > 0) {
        console.log(`  ❌ Found ${orphanedCompletions.rows.length} orphaned completion records`);
        orphanedCompletions.rows.forEach(orphan => {
          console.log(`    User: ${orphan.userId}, Missing Lesson ID: ${orphan.lessonId}`);
        });
      } else {
        console.log('  ✅ No orphaned completion records');
      }
    } catch (error) {
      console.log(`  Error checking completions: ${error.message}`);
    }

    console.log('\n✅ Database structure fix complete!');

  } catch (error) {
    console.error('❌ Error fixing database structure:', error);
  } finally {
    await pool.end();
  }
}

fixDatabaseStructure();