const { Pool } = require('pg');
const fs = require('fs');

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/DATABASE_URL=(.+)/);
    return match ? match[1].trim() : null;
  } catch (error) {
    return null;
  }
}

async function checkTable() {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    
    console.log('Checking UserFavoriteLesson table structure:');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'UserFavoriteLesson'
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\nChecking User table structure:');
    const userStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `);
    
    userStructure.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\nChecking User table for userId "14":');
    const userResult = await client.query(`
      SELECT * 
      FROM "User" 
      WHERE id = '14'
    `);
    
    if (userResult.rows.length > 0) {
      console.log('User found:', userResult.rows[0]);
    } else {
      console.log('User with ID "14" not found');
      
      // Check what users exist
      const allUsers = await client.query(`
        SELECT * 
        FROM "User" 
        ORDER BY "createdAt"
        LIMIT 5
      `);
      console.log('First 5 users in database:');
      allUsers.rows.forEach(user => {
        console.log(`- ID "${user.id}":`, user);
      });
    }
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTable();