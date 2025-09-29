import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Global variable to store PostgreSQL pool instance
const globalForPg = globalThis as unknown as {
  pool: Pool | undefined;
};

// Get DATABASE_URL with fallback and validation
function getDatabaseUrl(): string {
  // Try to get DATABASE_URL from environment
  let databaseUrl = process.env.DATABASE_URL;
  
  // If not found, try to load from .env file manually
  if (!databaseUrl && typeof window === 'undefined') {
    try {
      const envPath = path.join(process.cwd(), '.env');
      
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envLines = envContent.split('\n');
        
        for (const line of envLines) {
          if (line.startsWith('DATABASE_URL=')) {
            databaseUrl = line.split('=')[1].trim();
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error reading .env file:', error);
    }
  }
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }
  
  // Log the URL (without password for security)
  const urlForLogging = databaseUrl.replace(/:([^:@]+)@/, ':***@');
  console.log('✅ DATABASE_URL loaded successfully:', urlForLogging);
  console.log('🔍 Full URL length:', databaseUrl.length);
  
  return databaseUrl;
}

// Lazy initialization of PostgreSQL pool
function createPool(): Pool {
  if (globalForPg.pool) {
    return globalForPg.pool;
  }
  
  const newPool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false }, // Always use SSL for Supabase
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Увеличиваем до 10 секунд
    query_timeout: 30000, // Добавляем таймаут для запросов
  });
  
  // In development, store the pool on the global object to prevent multiple instances
  if (process.env.NODE_ENV !== 'production') {
    globalForPg.pool = newPool;
  }
  
  return newPool;
}

// Export a getter function instead of direct pool instance
export const getPool = (): Pool => {
  return createPool();
};

// Database connection helper
export async function connectToDatabase() {
  try {
    const pool = getPool();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connected to database');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    return false;
  }
}

// Database disconnection helper
export async function disconnectFromDatabase() {
  try {
    const pool = getPool();
    await pool.end();
    console.log('✅ Disconnected from database');
    return true;
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
    return false;
  }
}

// Health check helper
export async function checkDatabaseHealth() {
  try {
    const pool = getPool();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return { status: 'ok', message: 'Database is healthy' };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'error', message: 'Database is not responding' };
  }
}

// Get a database client for transactions
export async function getClient() {
  const pool = getPool();
  return await pool.connect();
}

// Seed data helper
export async function seedDatabase() {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if data already exists
    const existingThemes = await client.query('SELECT COUNT(*) FROM "Theme"');
    if (parseInt(existingThemes.rows[0].count) > 0) {
      console.log('Database already seeded');
      await client.query('ROLLBACK');
      return;
    }

    // Create sample themes
    const aiThemeResult = await client.query(`
      INSERT INTO "Theme" (slug, title, description, icon, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['ai-assistants', 'AI Ассистенты', 'Изучение и использование искусственного интеллекта', '🤖']);
    
    const aiThemeId = aiThemeResult.rows[0].id;

    const webThemeResult = await client.query(`
      INSERT INTO "Theme" (slug, title, description, icon, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['web-development', 'Веб-разработка', 'Современные технологии веб-разработки', '💻']);
    
    const webThemeId = webThemeResult.rows[0].id;

    // Create subtopics for AI theme
    const aiSubtopic1Result = await client.query(`
      INSERT INTO "Subtopic" (title, slug, description, "themeId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['Спринт сентябрь 2025', 'sprint-sentyabr-2025', 'Интенсивный курс по AI ассистентам', aiThemeId]);
    
    const aiSubtopic1Id = aiSubtopic1Result.rows[0].id;

    const aiSubtopic2Result = await client.query(`
      INSERT INTO "Subtopic" (title, slug, description, "themeId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['Архив', 'arhiv', 'Архивные материалы по AI', aiThemeId]);
    
    const aiSubtopic2Id = aiSubtopic2Result.rows[0].id;

    // Create subtopics for Web theme
    const webSubtopic1Result = await client.query(`
      INSERT INTO "Subtopic" (title, slug, description, "themeId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['Frontend', 'frontend', 'Разработка пользовательских интерфейсов', webThemeId]);
    
    const webSubtopic1Id = webSubtopic1Result.rows[0].id;

    const webSubtopic2Result = await client.query(`
      INSERT INTO "Subtopic" (title, slug, description, "themeId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id
    `, ['Backend', 'backend', 'Серверная разработка', webThemeId]);
    
    const webSubtopic2Id = webSubtopic2Result.rows[0].id;

    // Create lessons
    await client.query(`
      INSERT INTO "Lesson" (title, slug, content, "subtopicId", "createdAt", "updatedAt")
      VALUES 
        ($1, $2, $3, $4, NOW(), NOW()),
        ($5, $6, $7, $8, NOW(), NOW()),
        ($9, $10, $11, $12, NOW(), NOW()),
        ($13, $14, $15, $16, NOW(), NOW()),
        ($17, $18, $19, $20, NOW(), NOW())
    `, [
      'Введение в AI', 'vvedenie-v-ai', 'Подробное введение в мир AI...', aiSubtopic1Id,
      'Настройка AI ассистента', 'nastroyka-ai-assistenta', 'Пошаговое руководство по настройке...', aiSubtopic1Id,
      'История AI', 'istoriya-ai', 'История развития AI технологий...', aiSubtopic2Id,
      'React основы', 'react-osnovy', 'Введение в React библиотеку...', webSubtopic1Id,
      'Node.js основы', 'nodejs-osnovy', 'Основы серверной разработки на Node.js...', webSubtopic2Id
    ]);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully');
    return { aiThemeId, webThemeId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to seed database:', error);
    throw error;
  } finally {
    client.release();
  }
}