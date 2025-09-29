const { Client } = require('pg');

async function checkUserTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check what tables exist
    console.log('\n📋 Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%user%' OR table_name LIKE '%User%'
      ORDER BY table_name;
    `);
    
    console.log('User-related tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check User table structure if it exists
    if (tablesResult.rows.some(row => row.table_name === 'User')) {
      console.log('\n🔍 Checking "User" table structure...');
      const userTableResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'User' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log('Columns in "User" table:');
      userTableResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    }

    // Check users table structure if it exists
    if (tablesResult.rows.some(row => row.table_name === 'users')) {
      console.log('\n🔍 Checking "users" table structure...');
      const usersTableResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log('Columns in "users" table:');
      usersTableResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUserTable();