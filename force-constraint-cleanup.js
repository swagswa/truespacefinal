const { Pool } = require('pg');
require('dotenv').config();

async function forceConstraintCleanup() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('💪 Force constraint cleanup - aggressive approach...\n');

    // 1. Получаем точные имена constraints из системных таблиц
    console.log('🔍 Getting exact constraint names from system tables...');
    
    const systemConstraintsQuery = `
      SELECT 
        c.conname as constraint_name,
        t.relname as table_name,
        rt.relname as referenced_table
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_class rt ON c.confrelid = rt.oid
      WHERE t.relname IN ('user_favorite_lessons', 'user_lesson_completions')
      AND c.contype = 'f'
      ORDER BY t.relname, c.conname;
    `;
    
    const systemConstraints = await pool.query(systemConstraintsQuery);
    
    console.log(`Found ${systemConstraints.rows.length} constraints in system tables:`);
    systemConstraints.rows.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.table_name} -> ${constraint.referenced_table}`);
    });

    // 2. Принудительно удаляем каждый constraint по имени
    console.log('\n🔨 Force removing each constraint...');
    
    for (const constraint of systemConstraints.rows) {
      const constraintName = constraint.constraint_name;
      const tableName = constraint.table_name;
      
      try {
        // Пробуем разные варианты удаления
        const dropCommands = [
          `ALTER TABLE ${tableName} DROP CONSTRAINT "${constraintName}"`,
          `ALTER TABLE ${tableName} DROP CONSTRAINT ${constraintName}`,
          `ALTER TABLE "${tableName}" DROP CONSTRAINT "${constraintName}"`,
          `ALTER TABLE "${tableName}" DROP CONSTRAINT ${constraintName}`
        ];
        
        let dropped = false;
        for (const command of dropCommands) {
          if (!dropped) {
            try {
              console.log(`    Trying: ${command}`);
              await pool.query(command);
              console.log(`      ✅ Successfully dropped ${constraintName}`);
              dropped = true;
            } catch (error) {
              console.log(`      ❌ Failed: ${error.message}`);
            }
          }
        }
        
        if (!dropped) {
          console.log(`    ⚠️  Could not drop ${constraintName} with any method`);
        }
        
      } catch (error) {
        console.log(`    ❌ Error with ${constraintName}: ${error.message}`);
      }
    }

    // 3. Проверяем, что все constraints удалены
    console.log('\n🔍 Verifying constraint removal...');
    const remainingConstraints = await pool.query(systemConstraintsQuery);
    
    if (remainingConstraints.rows.length === 0) {
      console.log('  ✅ All constraints successfully removed!');
    } else {
      console.log(`  ⚠️  ${remainingConstraints.rows.length} constraints still remain:`);
      remainingConstraints.rows.forEach(constraint => {
        console.log(`    - ${constraint.constraint_name}: ${constraint.table_name} -> ${constraint.referenced_table}`);
      });
      
      // Если constraints всё ещё остались, попробуем CASCADE
      console.log('\n🔥 Trying CASCADE removal for remaining constraints...');
      for (const constraint of remainingConstraints.rows) {
        try {
          await pool.query(`ALTER TABLE ${constraint.table_name} DROP CONSTRAINT ${constraint.constraint_name} CASCADE`);
          console.log(`    ✅ CASCADE dropped ${constraint.constraint_name}`);
        } catch (error) {
          console.log(`    ❌ CASCADE failed for ${constraint.constraint_name}: ${error.message}`);
        }
      }
    }

    // 4. Создаём новые правильные constraints
    console.log('\n✅ Creating new correct constraints...');
    
    const newConstraints = [
      {
        table: 'user_favorite_lessons',
        name: 'fk_user_favorites_user',
        column: 'userId',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        table: 'user_favorite_lessons',
        name: 'fk_user_favorites_lesson',
        column: 'lessonId',
        refTable: '"Lesson"',
        refColumn: 'id'
      },
      {
        table: 'user_lesson_completions',
        name: 'fk_user_completions_user',
        column: 'userId',
        refTable: 'users',
        refColumn: 'id'
      },
      {
        table: 'user_lesson_completions',
        name: 'fk_user_completions_lesson',
        column: 'lessonId',
        refTable: '"Lesson"',
        refColumn: 'id'
      }
    ];

    for (const constraint of newConstraints) {
      try {
        const createQuery = `
          ALTER TABLE ${constraint.table} 
          ADD CONSTRAINT ${constraint.name} 
          FOREIGN KEY ("${constraint.column}") 
          REFERENCES ${constraint.refTable}(${constraint.refColumn}) 
          ON DELETE CASCADE
        `;
        
        console.log(`  Creating: ${constraint.name}`);
        await pool.query(createQuery);
        console.log(`    ✅ Created ${constraint.name}: ${constraint.table}.${constraint.column} -> ${constraint.refTable}.${constraint.refColumn}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`    ⚠️  ${constraint.name} already exists`);
        } else {
          console.log(`    ❌ Error creating ${constraint.name}: ${error.message}`);
        }
      }
    }

    // 5. Финальная проверка
    console.log('\n📋 Final constraint verification...');
    const finalConstraints = await pool.query(systemConstraintsQuery);
    
    console.log(`Final constraints (${finalConstraints.rows.length}):`);
    finalConstraints.rows.forEach(constraint => {
      const isCorrect = constraint.referenced_table === 'Lesson' || constraint.referenced_table === 'users';
      const status = isCorrect ? '✅' : '❌';
      console.log(`  ${status} ${constraint.constraint_name}: ${constraint.table_name} -> ${constraint.referenced_table}`);
    });

    // 6. Проверяем, что нет constraints, ссылающихся на 'lessons'
    const badConstraints = finalConstraints.rows.filter(c => c.referenced_table === 'lessons');
    if (badConstraints.length === 0) {
      console.log('\n🎉 SUCCESS: No constraints reference the old "lessons" table!');
    } else {
      console.log(`\n⚠️  WARNING: ${badConstraints.length} constraints still reference "lessons" table:`);
      badConstraints.forEach(constraint => {
        console.log(`    - ${constraint.constraint_name}`);
      });
    }

    // 7. Тестируем функциональность
    console.log('\n🧪 Testing database functionality...');
    
    try {
      // Тест с валидными данными
      const testUser = await pool.query('SELECT id FROM users LIMIT 1');
      const testLesson = await pool.query('SELECT id FROM "Lesson" LIMIT 1');
      
      if (testUser.rows.length > 0 && testLesson.rows.length > 0) {
        const userId = testUser.rows[0].id;
        const lessonId = testLesson.rows[0].id;
        
        // Тест добавления в избранное
        await pool.query(`
          INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
          VALUES ($1, $2, NOW())
          ON CONFLICT ("userId", "lessonId") DO NOTHING
        `, [userId, lessonId]);
        
        // Тест завершения урока
        await pool.query(`
          INSERT INTO user_lesson_completions ("userId", "lessonId", "completedAt")
          VALUES ($1, $2, NOW())
          ON CONFLICT ("userId", "lessonId") DO NOTHING
        `, [userId, lessonId]);
        
        console.log('  ✅ Valid operations successful');
        
        // Очистка тестовых данных
        await pool.query('DELETE FROM user_favorite_lessons WHERE "userId" = $1 AND "lessonId" = $2', [userId, lessonId]);
        await pool.query('DELETE FROM user_lesson_completions WHERE "userId" = $1 AND "lessonId" = $2', [userId, lessonId]);
        
      } else {
        console.log('  ⚠️  No test data available');
      }
      
      // Тест с невалидными данными
      try {
        await pool.query(`
          INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
          VALUES (99999, 1, NOW())
        `);
        console.log('  ❌ ERROR: Should have failed with invalid userId');
      } catch (error) {
        if (error.code === '23503') {
          console.log('  ✅ Foreign key constraints working correctly');
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Test failed: ${error.message}`);
    }

    console.log('\n🎯 Force cleanup completed!');
    console.log('Database should now be ready for application testing.');

  } catch (error) {
    console.error('❌ Error during force cleanup:', error);
  } finally {
    await pool.end();
  }
}

forceConstraintCleanup();