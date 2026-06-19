# Nest Nanny Services

NestJS API для сервісу нянь: автентифікація (access + refresh tokens), користувачі, пошта.

## Швидкий старт

### 1. Встановити залежності

```bash
npm install
```

### 2. Налаштувати `.env`

Створи файл `.env` у корені проєкту (приклад змінних):

```env
PORT=3000

MONGODB_USER=
MONGODB_PASSWORD=
MONGODB_URL=
MONGODB_DB=

JWT_SECRET=
JWT_ACCESS_EXPIRES=15m

FRONTEND_URL=http://localhost:5173

EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
SUPPORT_URL=
```

### 3. Запустити сервер (режим розробки)

```bash
npm run start:dev
```

Сервер буде доступний на `http://localhost:3000` (або на порту з `PORT`).

**Swagger (документація для Postman):** `http://localhost:3000/api`

Після змін у коді Nest перезапускається автоматично.

### Інші команди

```bash
# звичайний запуск (без watch)
npm run start

# production (спочатку npm run build)
npm run start:prod

# збірка
npm run build

# тести
npm run test
npm run test:e2e
```

## Тестування Auth API

Приклади через `curl` (підстав свій email/пароль).

### Реєстрація

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"user@example.com","password":"secret123"}'
```

### Логін

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
```

У відповіді збережи `accessToken` і `refreshToken`.

### Поточний користувач (потрібен access)

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### Оновити access (коли прострочився)

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

### Logout (відкликає refresh у БД)

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

## Auth ендпоінти

| Метод | Шлях | Авторизація |
|-------|------|-------------|
| POST | `/auth/register` | публічний |
| POST | `/auth/login` | публічний |
| POST | `/auth/refresh` | публічний |
| POST | `/auth/logout` | публічний (`refreshToken` у body) |
| POST | `/auth/forgot-password` | публічний |
| POST | `/auth/reset-password` | публічний |
| GET | `/auth/me` | Bearer access token |
