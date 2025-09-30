const { Pool } = require('pg');
require('dotenv').config();

async function checkDatabaseTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Checking all tables in database...\n');

    // 1. Получаем все таблицы в базе данных
    console.log('📋 All tables in database:');
    const allTables = await pool.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`Found ${allTables.rows.length} tables:`);
    allTables.rows.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    });

    // 2. Проверяем количество записей в каждой таблице
    console.log('\n📊 Record counts in each table:');
    for (const table of allTables.rows) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
        console.log(`  ${table.table_name}: ${countResult.rows[0].count} records`);
      } catch (error) {
        console.log(`  ${table.table_name}: Error counting records - ${error.message}`);
      }
    }

    // 3. Проверяем foreign key constraints
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
      ORDER BY tc.table_name, tc.constraint_name;
    `);
    
    console.log(`Found ${constraints.rows.length} foreign key constraints:`);
    constraints.rows.forEach(constraint => {
      console.log(`  ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });

    // 4. Проверяем дублирующиеся таблицы (разный регистр)
    console.log('\n🔍 Checking for duplicate tables with different cases:');
    const tableNames = allTables.rows.map(t => t.table_name);
    const duplicates = {};
    
    tableNames.forEach(name => {
      const lowerName = name.toLowerCase();
      if (!duplicates[lowerName]) {
        duplicates[lowerName] = [];
      }
      duplicates[lowerName].push(name);
    });

    Object.entries(duplicates).forEach(([baseName, variants]) => {
      if (variants.length > 1) {
        console.log(`  ⚠️  Duplicate tables for "${baseName}": ${variants.join(', ')}`);
      }
    });

    // 5. Проверяем структуру основных таблиц
    console.log('\n📋 Structure of main tables:');
    const mainTables = ['Theme', 'themes', 'Subtopic', 'subtopics', 'Lesson', 'lessons', 'User', 'users'];
    
    for (const tableName of mainTables) {
      if (tableNames.includes(tableName)) {
        console.log(`\n  📄 Table: ${tableName}`);
        try {
          const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = $1
            ORDER BY ordinal_position;
          `, [tableName]);
          
          structure.rows.forEach(col => {
            console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
          });
        } catch (error) {
          console.log(`    Error getting structure: ${error.message}`);
        }
      }
    }

    // 6. Проверяем orphaned записи
    console.log('\n🔍 Checking for orphaned records:');
    
    // Проверяем user_favorite_lessons
    try {
      const orphanedFavorites = await pool.query(`
        SELECT uf.*, 'missing_lesson' as issue_type
        FROM user_favorite_lessons uf
        LEFT JOIN "Lesson" l ON uf."lessonId" = l.id
        WHERE l.id IS NULL
        UNION ALL
        SELECT uf.*, 'missing_user' as issue_type
        FROM user_favorite_lessons uf
        LEFT JOIN "User" u ON uf."userId" = u.id
        WHERE u.id IS NULL;
      `);
      
      if (orphanedFavorites.rows.length > 0) {
        console.log(`  ❌ Found ${orphanedFavorites.rows.length} orphaned favorite records`);
        orphanedFavorites.rows.forEach(orphan => {
          console.log(`    User: ${orphan.userId}, Lesson: ${orphan.lessonId}, Issue: ${orphan.issue_type}`);
        });
      } else {
        console.log('  ✅ No orphaned favorite records');
      }
    } catch (error) {
      console.log(`  Error checking favorites: ${error.message}`);
    }

    // Проверяем user_lesson_completions
    try {
      const orphanedCompletions = await pool.query(`
        SELECT uc.*, 'missing_lesson' as issue_type
        FROM user_lesson_completions uc
        LEFT JOIN "Lesson" l ON uc."lessonId" = l.id
        WHERE l.id IS NULL
        UNION ALL
        SELECT uc.*, 'missing_user' as issue_type
        FROM user_lesson_completions uc
        LEFT JOIN "User" u ON uc."userId" = u.id
        WHERE u.id IS NULL;
      `);
      
      if (orphanedCompletions.rows.length > 0) {
        console.log(`  ❌ Found ${orphanedCompletions.rows.length} orphaned completion records`);
        orphanedCompletions.rows.forEach(orphan => {
          console.log(`    User: ${orphan.userId}, Lesson: ${orphan.lessonId}, Issue: ${orphan.issue_type}`);
        });
      } else {
        console.log('  ✅ No orphaned completion records');
      }
    } catch (error) {
      console.log(`  Error checking completions: ${error.message}`);
    }

    console.log('\n✅ Database analysis complete!');

  } catch (error) {
    console.error('❌ Error analyzing database:', error);
  } finally {
    await pool.end();
  }
}

checkDatabaseTables();