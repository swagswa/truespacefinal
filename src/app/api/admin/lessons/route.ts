import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { 
  createNotFoundError,
  createInternalError,
  createValidationError 
} from '@/lib/api-error-handler';

// Функция для создания slug из заголовка
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[а-я]/g, (char) => {
      const map: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET - получить все уроки для админ-панели
export async function GET(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const subtopicId = searchParams.get('subtopicId');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Построение SQL запроса с условиями фильтрации
    let whereClause = '';
    let countWhereClause = '';
    const queryParams: (string | number)[] = [];
    const countParams: (string | number)[] = [];
    let paramIndex = 1;

    if (subtopicId) {
      whereClause += ` AND l."subtopicId" = $${paramIndex}`;
      countWhereClause += ` AND "subtopicId" = $${paramIndex}`;
      queryParams.push(parseInt(subtopicId));
      countParams.push(parseInt(subtopicId));
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND l.title ILIKE $${paramIndex}`;
      countWhereClause += ` AND title ILIKE $${paramIndex}`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern);
      countParams.push(searchPattern);
      paramIndex++;
    }

    // Добавляем параметры пагинации
    queryParams.push(limit, offset);

    // Получение уроков с пагинацией
    const lessonsQuery = `
      SELECT 
        l.id,
        l.title,
        l.slug,
        l.content,
        l."subtopicId",
        l."createdAt",
        l."updatedAt",
        s.title as subtopic_title,
        t.title as theme_title
      FROM "Lesson" l
      JOIN "Subtopic" s ON l."subtopicId" = s.id
      JOIN "Theme" t ON s."themeId" = t.id
      WHERE 1=1 ${whereClause}
      ORDER BY l."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM "Lesson"
      WHERE 1=1 ${countWhereClause}
    `;

    const [lessonsResult, countResult] = await Promise.all([
      client.query(lessonsQuery, queryParams),
      client.query(countQuery, countParams)
    ]);

    const lessons = lessonsResult.rows;
    const total = parseInt(countResult.rows[0].total);

    // Форматирование данных для админ-панели
    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content,
      subtopicId: lesson.subtopicId,
      subtopic: lesson.subtopic_title,
      theme: lesson.theme_title,
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        lessons: formattedLessons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    return createInternalError(error);
  } finally {
    client.release();
  }
}

// POST - создать новый урок
export async function POST(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { title, content, subtopicId } = body;

    // Валидация
    if (!title || !content || !subtopicId) {
      return createValidationError('Title, content, and subtopicId are required');
    }

    // Проверка существования подтемы
    const subtopicQuery = 'SELECT id, title FROM "Subtopic" WHERE id = $1';
    const subtopicResult = await client.query(subtopicQuery, [parseInt(subtopicId)]);

    if (subtopicResult.rows.length === 0) {
      return createNotFoundError('Subtopic not found');
    }

    // Создание slug
    const baseSlug = createSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Проверка уникальности slug
    while (true) {
      const slugCheckQuery = 'SELECT id FROM "Lesson" WHERE slug = $1';
      const slugResult = await client.query(slugCheckQuery, [slug]);
      if (slugResult.rows.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Создание урока
    const insertQuery = `
      INSERT INTO "Lesson" (title, slug, content, "subtopicId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, title, slug, content, "subtopicId", "createdAt", "updatedAt"
    `;

    const lessonResult = await client.query(insertQuery, [
      title,
      slug,
      content,
      parseInt(subtopicId)
    ]);

    const lesson = lessonResult.rows[0];

    // Получение информации о подтеме и теме
    const detailsQuery = `
      SELECT 
        s.title as subtopic_title,
        t.title as theme_title
      FROM "Subtopic" s
      JOIN "Theme" t ON s."themeId" = t.id
      WHERE s.id = $1
    `;
    const detailsResult = await client.query(detailsQuery, [parseInt(subtopicId)]);
    const details = detailsResult.rows[0];

    // Форматирование ответа
    const formattedLesson = {
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content,
      subtopicId: lesson.subtopicId,
      subtopic: details.subtopic_title,
      theme: details.theme_title,
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedLesson,
      message: 'Lesson created successfully'
    }, { status: 201 });

  } catch (error) {
    return createInternalError(error);
  } finally {
    client.release();
  }
}

// PUT - обновить урок
export async function PUT(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { id, title, content, subtopicId } = body;

    // Валидация
    if (!id) {
      return createValidationError('Lesson ID is required');
    }

    // Проверка существования урока
    const existingLessonQuery = 'SELECT * FROM "Lesson" WHERE id = $1';
    const existingLessonResult = await client.query(existingLessonQuery, [parseInt(id)]);

    if (existingLessonResult.rows.length === 0) {
      return createNotFoundError('Lesson not found');
    }

    const existingLesson = existingLessonResult.rows[0];

    // Проверка существования подтемы (если изменяется)
    if (subtopicId && subtopicId !== existingLesson.subtopicId) {
      const subtopicQuery = 'SELECT id FROM "Subtopic" WHERE id = $1';
      const subtopicResult = await client.query(subtopicQuery, [parseInt(subtopicId)]);

      if (subtopicResult.rows.length === 0) {
        return createNotFoundError('Subtopic not found');
      }
    }

    // Подготовка данных для обновления
    const updateFields: string[] = [];
    const updateValues: (string | number)[] = [];
    let paramIndex = 1;

    if (title && title !== existingLesson.title) {
      updateFields.push(`title = $${paramIndex}`);
      updateValues.push(title);
      paramIndex++;

      // Создание нового slug если изменился заголовок
      const baseSlug = createSlug(title);
      let slug = baseSlug;
      let counter = 1;

      // Проверка уникальности slug (исключая текущий урок)
      while (true) {
        const slugCheckQuery = 'SELECT id FROM "Lesson" WHERE slug = $1 AND id != $2';
        const slugResult = await client.query(slugCheckQuery, [slug, parseInt(id)]);
        if (slugResult.rows.length === 0) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      updateFields.push(`slug = $${paramIndex}`);
      updateValues.push(slug);
      paramIndex++;
    }

    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex}`);
      updateValues.push(content);
      paramIndex++;
    }

    if (subtopicId !== undefined) {
      updateFields.push(`"subtopicId" = $${paramIndex}`);
      updateValues.push(parseInt(subtopicId));
      paramIndex++;
    }

    if (updateFields.length > 0) {
      updateFields.push(`"updatedAt" = NOW()`);
      updateValues.push(parseInt(id));

      const updateQuery = `
        UPDATE "Lesson" 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, title, slug, content, "subtopicId", "createdAt", "updatedAt"
      `;

      const updateResult = await client.query(updateQuery, updateValues);
      const lesson = updateResult.rows[0];

      // Получение информации о подтеме и теме
      const detailsQuery = `
        SELECT 
          s.title as subtopic_title,
          t.title as theme_title
        FROM "Subtopic" s
        JOIN "Theme" t ON s."themeId" = t.id
        WHERE s.id = $1
      `;
      const detailsResult = await client.query(detailsQuery, [lesson.subtopicId]);
      const details = detailsResult.rows[0];

      // Форматирование ответа
      const formattedLesson = {
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        content: lesson.content,
        subtopicId: lesson.subtopicId,
        subtopic: details.subtopic_title,
        theme: details.theme_title,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString()
      };

      return NextResponse.json({
        success: true,
        data: formattedLesson,
        message: 'Lesson updated successfully'
      });
    } else {
      // Если нет изменений, возвращаем существующий урок
      const detailsQuery = `
        SELECT 
          l.*,
          s.title as subtopic_title,
          t.title as theme_title
        FROM "Lesson" l
        JOIN "Subtopic" s ON l."subtopicId" = s.id
        JOIN "Theme" t ON s."themeId" = t.id
        WHERE l.id = $1
      `;
      const detailsResult = await client.query(detailsQuery, [parseInt(id)]);
      const lesson = detailsResult.rows[0];

      const formattedLesson = {
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        content: lesson.content,
        subtopicId: lesson.subtopicId,
        subtopic: lesson.subtopic_title,
        theme: lesson.theme_title,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString()
      };

      return NextResponse.json({
        success: true,
        data: formattedLesson,
        message: 'No changes made'
      });
    }

  } catch (error) {
    return createInternalError(error);
  } finally {
    client.release();
  }
}

// DELETE - удалить урок
export async function DELETE(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createValidationError('Lesson ID is required');
    }

    // Проверка существования урока
    const existingLessonQuery = 'SELECT id FROM "Lesson" WHERE id = $1';
    const existingLessonResult = await client.query(existingLessonQuery, [parseInt(id)]);

    if (existingLessonResult.rows.length === 0) {
      return createNotFoundError('Lesson not found');
    }

    // Удаление урока (каскадное удаление связанных записей настроено в схеме)
    const deleteQuery = 'DELETE FROM "Lesson" WHERE id = $1';
    await client.query(deleteQuery, [parseInt(id)]);

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    return createInternalError(error);
  } finally {
    client.release();
  }
}