const { Pool } = require('pg');
require('dotenv').config();

async function checkForeignKeyIssues() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Checking database structure and foreign key issues...\n');

    // 1. Проверяем структуру таблицы lessons
    console.log('📋 Lessons table structure:');
    const lessonsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'lessons' OR table_name = 'Lesson'
      ORDER BY ordinal_position;
    `);
    console.log(lessonsStructure.rows);

    // 2. Проверяем все уроки в таблице
    console.log('\n📚 All lessons in database:');
    const allLessons = await pool.query(`
      SELECT id, title, slug, "subtopicId", "createdAt"
      FROM "Lesson" 
      ORDER BY id;
    `);
    console.log(`Found ${allLessons.rows.length} lessons:`);
    allLessons.rows.forEach(lesson => {
      console.log(`  ID: ${lesson.id}, Title: ${lesson.title}, Subtopic: ${lesson.subtopicId}`);
    });

    // 3. Проверяем записи в user_favorite_lessons
    console.log('\n❤️ User favorite lessons:');
    const favorites = await pool.query(`
      SELECT * FROM user_favorite_lessons ORDER BY "lessonId";
    `);
    console.log(`Found ${favorites.rows.length} favorite records:`);
    favorites.rows.forEach(fav => {
      console.log(`  User: ${fav.userId}, Lesson: ${fav.lessonId}`);
    });

    // 4. Проверяем записи в user_lesson_completions
    console.log('\n✅ User lesson completions:');
    const completions = await pool.query(`
      SELECT * FROM user_lesson_completions ORDER BY "lessonId";
    `);
    console.log(`Found ${completions.rows.length} completion records:`);
    completions.rows.forEach(comp => {
      console.log(`  User: ${comp.userId}, Lesson: ${comp.lessonId}, Completed: ${comp.completedAt}`);
    });

    // 5. Ищем orphaned записи в favorites
    console.log('\n🔍 Checking for orphaned favorite records:');
    const orphanedFavorites = await pool.query(`
      SELECT uf.* 
      FROM user_favorite_lessons uf
      LEFT JOIN "Lesson" l ON uf."lessonId" = l.id
      WHERE l.id IS NULL;
    `);
    if (orphanedFavorites.rows.length > 0) {
      console.log(`❌ Found ${orphanedFavorites.rows.length} orphaned favorite records:`);
      orphanedFavorites.rows.forEach(orphan => {
        console.log(`  User: ${orphan.userId}, Missing Lesson ID: ${orphan.lessonId}`);
      });
    } else {
      console.log('✅ No orphaned favorite records found');
    }

    // 6. Ищем orphaned записи в completions
    console.log('\n🔍 Checking for orphaned completion records:');
    const orphanedCompletions = await pool.query(`
      SELECT uc.* 
      FROM user_lesson_completions uc
      LEFT JOIN "Lesson" l ON uc."lessonId" = l.id
      WHERE l.id IS NULL;
    `);
    if (orphanedCompletions.rows.length > 0) {
      console.log(`❌ Found ${orphanedCompletions.rows.length} orphaned completion records:`);
      orphanedCompletions.rows.forEach(orphan => {
        console.log(`  User: ${orphan.userId}, Missing Lesson ID: ${orphan.lessonId}`);
      });
    } else {
      console.log('✅ No orphaned completion records found');
    }

    // 7. Проверяем foreign key constraints
    console.log('\n🔗 Foreign key constraints:');
    const constraints = await pool.query(`
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
        AND (tc.table_name = 'user_favorite_lessons' OR tc.table_name = 'user_lesson_completions');
    `);
    constraints.rows.forEach(constraint => {
      console.log(`  ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });

  } catch (error) {
    console.error('❌ Error checking foreign key issues:', error);
  } finally {
    await pool.end();
  }
}

checkForeignKeyIssues();