const { Pool } = require('pg');
require('dotenv').config();

async function fixFinalConstraints() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔧 Fixing final foreign key constraints...\n');

    // 1. Проверяем текущие constraints
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
      console.log(`  ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name} (${constraint.constraint_name})`);
    });

    // 2. Удаляем неправильные constraints (те, что ссылаются на lessons вместо Lesson)
    console.log('\n🗑️ Removing incorrect constraints...');
    
    const incorrectConstraints = currentConstraints.rows.filter(c => 
      c.column_name === 'lessonId' && c.foreign_table_name === 'lessons'
    );

    for (const constraint of incorrectConstraints) {
      try {
        console.log(`  Dropping: ${constraint.constraint_name}`);
        await pool.query(`ALTER TABLE ${constraint.table_name} DROP CONSTRAINT ${constraint.constraint_name}`);
        console.log(`    ✅ Dropped ${constraint.constraint_name}`);
      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
      }
    }

    // 3. Также удаляем дублирующиеся constraints для userId
    console.log('\n🗑️ Removing duplicate userId constraints...');
    
    const userIdConstraints = currentConstraints.rows.filter(c => 
      c.column_name === 'userId' && c.foreign_table_name === 'users'
    );

    // Оставляем только один constraint для каждой таблицы
    const constraintsByTable = {};
    userIdConstraints.forEach(c => {
      if (!constraintsByTable[c.table_name]) {
        constraintsByTable[c.table_name] = [];
      }
      constraintsByTable[c.table_name].push(c);
    });

    for (const [tableName, constraints] of Object.entries(constraintsByTable)) {
      if (constraints.length > 1) {
        // Удаляем все кроме первого
        for (let i = 1; i < constraints.length; i++) {
          try {
            console.log(`  Dropping duplicate: ${constraints[i].constraint_name}`);
            await pool.query(`ALTER TABLE ${tableName} DROP CONSTRAINT ${constraints[i].constraint_name}`);
            console.log(`    ✅ Dropped ${constraints[i].constraint_name}`);
          } catch (error) {
            console.log(`    ❌ Error: ${error.message}`);
          }
        }
      }
    }

    // 4. Создаём правильные constraints для lessonId (ссылающиеся на Lesson)
    console.log('\n✅ Creating correct constraints...');
    
    const tablesToFix = ['user_favorite_lessons', 'user_lesson_completions'];
    
    for (const tableName of tablesToFix) {
      try {
        console.log(`  Creating lessonId constraint for ${tableName}`);
        await pool.query(`
          ALTER TABLE ${tableName} 
          ADD CONSTRAINT ${tableName}_lessonId_fkey 
          FOREIGN KEY ("lessonId") REFERENCES "Lesson"(id) ON DELETE CASCADE
        `);
        console.log(`    ✅ Created constraint for ${tableName}.lessonId -> Lesson.id`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`    ⚠️  Constraint already exists for ${tableName}`);
        } else {
          console.log(`    ❌ Error: ${error.message}`);
        }
      }
    }

    // 5. Финальная проверка
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

    // 6. Проверяем, что нет orphaned records
    console.log('\n🔍 Checking for orphaned records...');
    
    const orphanedFavorites = await pool.query(`
      SELECT uf.* FROM user_favorite_lessons uf
      LEFT JOIN "Lesson" l ON uf."lessonId" = l.id
      LEFT JOIN users u ON uf."userId" = u.id
      WHERE l.id IS NULL OR u.id IS NULL
    `);
    
    const orphanedCompletions = await pool.query(`
      SELECT uc.* FROM user_lesson_completions uc
      LEFT JOIN "Lesson" l ON uc."lessonId" = l.id
      LEFT JOIN users u ON uc."userId" = u.id
      WHERE l.id IS NULL OR u.id IS NULL
    `);

    console.log(`  Orphaned favorites: ${orphanedFavorites.rows.length}`);
    console.log(`  Orphaned completions: ${orphanedCompletions.rows.length}`);

    console.log('\n✅ All foreign key constraints fixed!');

  } catch (error) {
    console.error('❌ Error fixing constraints:', error);
  } finally {
    await pool.end();
  }
}

fixFinalConstraints();