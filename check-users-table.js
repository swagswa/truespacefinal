const { Pool } = require('pg');
require('dotenv').config();

async function checkUsersTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/urok_db'
  });

  try {
    console.log('Checking users table...');
    
    // Проверяем все записи в таблице users
    const allUsersResult = await pool.query('SELECT * FROM users ORDER BY "createdAt" DESC LIMIT 10');
    console.log('All users in users table:');
    console.log(allUsersResult.rows);
    
    // Ищем конкретного пользователя
    const specificUserResult = await pool.query('SELECT * FROM users WHERE "telegramId" = $1', ['6338779682']);
    console.log('\nUser with telegramId 6338779682:');
    console.log(specificUserResult.rows);
    
    // Проверяем таблицу User (с заглавной буквы)
    try {
      const userTableResult = await pool.query('SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 10');
      console.log('\nAll users in User table:');
      console.log(userTableResult.rows);
    } catch (error) {
      console.log('\nUser table (with capital U) does not exist or error:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkUsersTable();