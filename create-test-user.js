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

async function createTestUser() {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    
    console.log('Creating test user with telegramId "14"...');
    
    // Создаем тестового пользователя
    const result = await client.query(`
      INSERT INTO "User" (id, email, name, "telegramId", "createdAt", "updatedAt")
      VALUES ('14', 'telegram14@example.com', 'Telegram User 14', '14', NOW(), NOW())
      ON CONFLICT ("telegramId") DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        "updatedAt" = NOW()
      RETURNING *
    `);
    
    console.log('Test user created/updated:', result.rows[0]);
    
    // Проверяем всех пользователей
    console.log('\nAll users in database:');
    const allUsers = await client.query(`
      SELECT id, email, name, "telegramId", "createdAt"
      FROM "User" 
      ORDER BY "createdAt"
    `);
    
    allUsers.rows.forEach(user => {
      console.log(`- ID: ${user.id}, telegramId: ${user.telegramId}, name: ${user.name}, email: ${user.email}`);
    });
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUser();