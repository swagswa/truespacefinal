const { Pool } = require('pg');
require('dotenv').config();

async function migrateAndCleanupData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Migrating data and cleaning up duplicates...\n');

    // 1. Проверяем данные в таблицах с большой буквы
    console.log('📊 Data in uppercase tables:');
    
    const userDataUpper = await pool.query('SELECT * FROM "User" ORDER BY id');
    console.log(`  "User" table: ${userDataUpper.rows.length} records`);
    userDataUpper.rows.forEach(user => {
      console.log(`    ID: ${user.id}, Email: ${user.email}, TelegramId: ${user.telegramId}`);
    });

    const favoritesDataUpper = await pool.query('SELECT * FROM "UserFavoriteLesson" ORDER BY id');
    console.log(`  "UserFavoriteLesson" table: ${favoritesDataUpper.rows.length} records`);
    favoritesDataUpper.rows.forEach(fav => {
      console.log(`    ID: ${fav.id}, User: ${fav.userId}, Lesson: ${fav.lessonId}`);
    });

    const completionsDataUpper = await pool.query('SELECT * FROM "UserLessonCompletion" ORDER BY id');
    console.log(`  "UserLessonCompletion" table: ${completionsDataUpper.rows.length} records`);
    completionsDataUpper.rows.forEach(comp => {
      console.log(`    ID: ${comp.id}, User: ${comp.userId}, Lesson: ${comp.lessonId}`);
    });

    // 2. Проверяем данные в таблицах с маленькой буквы
    console.log('\n📊 Data in lowercase tables:');
    
    const userDataLower = await pool.query('SELECT * FROM users ORDER BY id');
    console.log(`  users table: ${userDataLower.rows.length} records`);
    userDataLower.rows.forEach(user => {
      console.log(`    ID: ${user.id}, Email: ${user.email}, TelegramId: ${user.telegramId}`);
    });

    const favoritesDataLower = await pool.query('SELECT * FROM user_favorite_lessons ORDER BY "userId", "lessonId"');
    console.log(`  user_favorite_lessons table: ${favoritesDataLower.rows.length} records`);
    favoritesDataLower.rows.forEach(fav => {
      console.log(`    User: ${fav.userId}, Lesson: ${fav.lessonId}`);
    });

    const completionsDataLower = await pool.query('SELECT * FROM user_lesson_completions ORDER BY "userId", "lessonId"');
    console.log(`  user_lesson_completions table: ${completionsDataLower.rows.length} records`);
    completionsDataLower.rows.forEach(comp => {
      console.log(`    User: ${comp.userId}, Lesson: ${comp.lessonId}, Completed: ${comp.completedAt}`);
    });

    // 3. Мигрируем данные из UserFavoriteLesson в user_favorite_lessons (если нужно)
    console.log('\n🔄 Migrating favorites data...');
    for (const favorite of favoritesDataUpper.rows) {
      try {
        // Проверяем, есть ли уже такая запись
        const existing = await pool.query(`
          SELECT * FROM user_favorite_lessons 
          WHERE "userId" = $1 AND "lessonId" = $2
        `, [favorite.userId, favorite.lessonId]);

        if (existing.rows.length === 0) {
          await pool.query(`
            INSERT INTO user_favorite_lessons ("userId", "lessonId", "createdAt")
            VALUES ($1, $2, $3)
          `, [favorite.userId, favorite.lessonId, favorite.createdAt || new Date()]);
          console.log(`  ✅ Migrated favorite: User ${favorite.userId}, Lesson ${favorite.lessonId}`);
        } else {
          console.log(`  ⚠️  Favorite already exists: User ${favorite.userId}, Lesson ${favorite.lessonId}`);
        }
      } catch (error) {
        console.log(`  ❌ Error migrating favorite: ${error.message}`);
      }
    }

    // 4. Мигрируем данные из UserLessonCompletion в user_lesson_completions (если нужно)
    console.log('\n🔄 Migrating completions data...');
    for (const completion of completionsDataUpper.rows) {
      try {
        // Проверяем, есть ли уже такая запись
        const existing = await pool.query(`
          SELECT * FROM user_lesson_completions 
          WHERE "userId" = $1 AND "lessonId" = $2
        `, [completion.userId, completion.lessonId]);

        if (existing.rows.length === 0) {
          await pool.query(`
            INSERT INTO user_lesson_completions ("userId", "lessonId", "completedAt")
            VALUES ($1, $2, $3)
          `, [completion.userId, completion.lessonId, completion.completedAt || new Date()]);
          console.log(`  ✅ Migrated completion: User ${completion.userId}, Lesson ${completion.lessonId}`);
        } else {
          console.log(`  ⚠️  Completion already exists: User ${completion.userId}, Lesson ${completion.lessonId}`);
        }
      } catch (error) {
        console.log(`  ❌ Error migrating completion: ${error.message}`);
      }
    }

    // 5. Удаляем дублирующиеся foreign key constraints
    console.log('\n🗑️ Cleaning up duplicate foreign key constraints...');
    
    const allConstraints = await pool.query(`
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

    // Группируем constraints по таблице и колонке
    const constraintGroups = {};
    allConstraints.rows.forEach(constraint => {
      const key = `${constraint.table_name}.${constraint.column_name}`;
      if (!constraintGroups[key]) {
        constraintGroups[key] = [];
      }
      constraintGroups[key].push(constraint);
    });

    // Удаляем дублирующиеся constraints (оставляем только те, что ссылаются на правильные таблицы)
    for (const [key, constraints] of Object.entries(constraintGroups)) {
      if (constraints.length > 1) {
        console.log(`  Found ${constraints.length} constraints for ${key}`);
        
        // Удаляем constraints, которые ссылаются на неправильные таблицы
        for (const constraint of constraints) {
          const shouldKeep = 
            (constraint.column_name === 'lessonId' && constraint.foreign_table_name === 'Lesson') ||
            (constraint.column_name === 'userId' && constraint.foreign_table_name === 'users');
          
          if (!shouldKeep) {
            try {
              console.log(`    Dropping incorrect constraint: ${constraint.constraint_name}`);
              await pool.query(`ALTER TABLE ${constraint.table_name} DROP CONSTRAINT IF EXISTS ${constraint.constraint_name}`);
            } catch (error) {
              console.log(`      Warning: ${error.message}`);
            }
          } else {
            console.log(`    Keeping correct constraint: ${constraint.constraint_name} -> ${constraint.foreign_table_name}`);
          }
        }
      }
    }

    // 6. Теперь можно безопасно удалить таблицы с большой буквы
    console.log('\n🗑️ Removing uppercase tables after data migration...');
    
    const tablesToRemove = ['UserFavoriteLesson', 'UserLessonCompletion', 'User'];
    
    for (const tableName of tablesToRemove) {
      try {
        console.log(`  Dropping table "${tableName}"`);
        await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
        console.log(`    ✅ Dropped "${tableName}"`);
      } catch (error) {
        console.log(`    ❌ Error dropping "${tableName}": ${error.message}`);
      }
    }

    // 7. Финальная проверка
    console.log('\n📋 Final database state:');
    
    const finalTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Remaining tables:');
    finalTables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

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
    
    console.log('\nFinal foreign key constraints:');
    finalConstraints.rows.forEach(constraint => {
      console.log(`  ✅ ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });

    console.log('\n✅ Migration and cleanup complete!');

  } catch (error) {
    console.error('❌ Error during migration and cleanup:', error);
  } finally {
    await pool.end();
  }
}

migrateAndCleanupData();