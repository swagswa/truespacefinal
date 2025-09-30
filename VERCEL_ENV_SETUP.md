# Vercel Environment Variables Setup

## Required Environment Variables

Для корректной работы приложения на Vercel необходимо настроить следующие переменные окружения:

### 1. DATABASE_URL
```
DATABASE_URL=postgresql://postgres.digqlqjbdtbwvrgggrnl:50GV5cssgniHFpBg@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```
- **Описание**: URL подключения к базе данных Supabase
- **Обязательно**: Да
- **Где взять**: Из панели Supabase → Settings → Database → Connection string

### 2. TELEGRAM_BOT_TOKEN
```
TELEGRAM_BOT_TOKEN=8215178460:AAFTKSvs-lFM_vtHsKCI1bdK_w-76n2QUgY
```
- **Описание**: Токен Telegram бота для валидации initData
- **Обязательно**: Да
- **Где взять**: От @BotFather в Telegram

### 3. NEXTAUTH_SECRET
```
NEXTAUTH_SECRET=your-secret-key-here
```
- **Описание**: Секретный ключ для NextAuth.js
- **Обязательно**: Да для production
- **Рекомендация**: Сгенерировать случайную строку длиной 32+ символов

### 4. NEXTAUTH_URL
```
NEXTAUTH_URL=https://your-app.vercel.app
```
- **Описание**: URL вашего приложения на Vercel
- **Обязательно**: Да для production
- **Пример**: https://truespacefinal.vercel.app

## Как настроить в Vercel

1. Откройте проект в панели Vercel
2. Перейдите в Settings → Environment Variables
3. Добавьте каждую переменную:
   - **Name**: Имя переменной (например, DATABASE_URL)
   - **Value**: Значение переменной
   - **Environment**: Production, Preview, Development (выберите нужные)

## Проверка настройки

После настройки переменных окружения:

1. Сделайте новый деплой (или Redeploy)
2. Проверьте логи в Vercel Functions
3. Убедитесь, что в логах появляются сообщения:
   - `✅ Bot token available: Yes`
   - `✅ Database URL available: Yes`
   - `✅ Database pool obtained`
   - `✅ Database client connected`

## Возможные проблемы

### 1. Database connection error
- Проверьте правильность DATABASE_URL
- Убедитесь, что Supabase база данных доступна
- Проверьте настройки SSL (должно быть включено)

### 2. Bot token error
- Проверьте правильность TELEGRAM_BOT_TOKEN
- Убедитесь, что токен активен в @BotFather

### 3. Timeout errors
- Увеличьте таймауты в настройках Vercel
- Проверьте регион деплоя (должен быть близко к базе данных)

## Безопасность

⚠️ **ВАЖНО**: Никогда не коммитьте файл `.env` в Git!

- Файл `.env` должен быть в `.gitignore`
- Используйте только панель Vercel для настройки переменных
- Регулярно обновляйте секретные ключи