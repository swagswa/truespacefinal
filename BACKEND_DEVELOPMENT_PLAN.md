# План разработки бэкенда для TrueSpace Образовательная Платформа

## Обзор проекта

TrueSpace - это образовательная платформа на Next.js, которая предоставляет доступ к различным темам обучения и урокам. В настоящее время фронтенд взаимодействует с внешним API на `http://localhost:1337`.

## Текущее состояние

### Существующая архитектура
- **Frontend**: Next.js 15 с TypeScript
- **UI**: Radix UI компоненты, Tailwind CSS
- **Состояние**: React hooks для управления данными
- **API клиент**: Централизованный ApiClient в `src/lib/api.ts`
- **Внешний API**: Strapi на порту 1337

### Текущие API endpoints
- `GET /api/themes` - получение списка тем
- `GET /api/themes/{themeSlug}/subtopics` - получение подтем
- `GET /api/health` - проверка состояния бэкенда

## План разработки бэкенда на Next.js

### Этап 1: Настройка API Routes

#### 1.1 Создание базовой структуры API
```
src/app/api/
├── health/
│   └── route.ts
├── themes/
│   ├── route.ts
│   └── [themeSlug]/
│       └── subtopics/
│           └── route.ts
└── admin/
    ├── themes/
    │   └── route.ts
    └── lessons/
        └── route.ts
```

#### 1.2 Реализация основных endpoints

**Health Check API**
- `GET /api/health` - проверка состояния сервера
- Возвращает статус сервера и время ответа

**Themes API**
- `GET /api/themes` - получение всех тем
- `POST /api/themes` - создание новой темы (админ)
- `PUT /api/themes/[id]` - обновление темы (админ)
- `DELETE /api/themes/[id]` - удаление темы (админ)

**Subtopics API**
- `GET /api/themes/[themeSlug]/subtopics` - получение подтем для темы
- `POST /api/themes/[themeSlug]/subtopics` - создание подтемы (админ)

### Этап 2: Модели данных и типы

#### 2.1 Создание TypeScript интерфейсов
```typescript
// src/types/api.ts
interface Theme {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Subtopic {
  id: string;
  title: string;
  description: string;
  themeId: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  subtopicId: string;
}
```

#### 2.2 Валидация данных
- Использование Zod для валидации входящих данных
- Создание схем валидации для каждого endpoint

### Этап 3: База данных

#### 3.1 Выбор решения для хранения данных
**Рекомендуемые варианты:**
1. **SQLite + Prisma** (для разработки и небольших проектов)
2. **PostgreSQL + Prisma** (для продакшена)
3. **MongoDB + Mongoose** (если нужна гибкость схемы)

#### 3.2 Настройка Prisma (рекомендуемый вариант)
```prisma
// prisma/schema.prisma
model Theme {
  id          String     @id @default(cuid())
  slug        String     @unique
  title       String
  description String
  icon        String
  subtopics   Subtopic[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Subtopic {
  id          String   @id @default(cuid())
  title       String
  description String
  theme       Theme    @relation(fields: [themeId], references: [id])
  themeId     String
  lessons     Lesson[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Lesson {
  id          String   @id @default(cuid())
  title       String
  description String
  content     String
  duration    Int
  subtopic    Subtopic @relation(fields: [subtopicId], references: [id])
  subtopicId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Этап 4: Аутентификация и авторизация

#### 4.1 Настройка NextAuth.js
- Интеграция с NextAuth.js для управления сессиями
- Поддержка различных провайдеров (Google, GitHub, email)

#### 4.2 Защита админских endpoints
- Middleware для проверки прав доступа
- Роли пользователей (admin, user)

### Этап 5: Миграция с внешнего API

#### 5.1 Создание миграционных скриптов
- Скрипт для импорта данных из Strapi
- Сохранение существующей структуры данных

#### 5.2 Обновление ApiClient
- Постепенная замена внешних вызовов на внутренние API routes
- Обратная совместимость во время миграции

### Этап 6: Оптимизация и кэширование

#### 6.1 Кэширование данных
- Использование Next.js кэширования для статических данных
- Redis для кэширования динамических данных (опционально)

#### 6.2 Оптимизация запросов
- Пагинация для больших списков
- Ленивая загрузка контента уроков

### Этап 7: Тестирование

#### 7.1 Unit тесты
- Тестирование API routes с Jest
- Мокирование базы данных

#### 7.2 Integration тесты
- Тестирование полного цикла API запросов
- Тестирование аутентификации

## Временные рамки

### Неделя 1-2: Базовая настройка
- Создание API routes
- Настройка базы данных
- Основные CRUD операции

### Неделя 3: Аутентификация
- Интеграция NextAuth.js
- Защита админских endpoints

### Неделя 4: Миграция данных
- Импорт существующих данных
- Обновление фронтенда

### Неделя 5: Оптимизация и тестирование
- Кэширование
- Написание тестов
- Оптимизация производительности

## Необходимые зависимости

```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "zod": "^3.22.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@types/bcryptjs": "^2.4.0",
    "jest": "^29.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

## Рекомендации по безопасности

1. **Валидация входных данных** - использование Zod схем
2. **Rate limiting** - ограничение количества запросов
3. **CORS настройки** - правильная настройка CORS политик
4. **Санитизация данных** - очистка пользовательского ввода
5. **Логирование** - детальное логирование для мониторинга

## Мониторинг и логирование

1. **Структурированное логирование** с Winston или Pino
2. **Метрики производительности** API endpoints
3. **Мониторинг ошибок** с Sentry (опционально)
4. **Health checks** для всех критических компонентов

## Заключение

Данный план обеспечивает поэтапную миграцию с внешнего API на собственный бэкенд Next.js, сохраняя при этом существующую функциональность и улучшая производительность и безопасность приложения.