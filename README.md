# Nest Nanny Services

NestJS API for a nanny booking service: authentication (access + refresh tokens), users, nannies, favorites, and email.

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure `.env`

Create a `.env` file in the project root:

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

### 3. Run the server (development)

```bash
npm run start:dev
```

The server runs at `http://localhost:3000` (or the port from `PORT`).

**Swagger:** `http://localhost:3000/api`

Nest reloads automatically when you change the code.

### Other commands

```bash
# standard start (no watch)
npm run start

# production (run npm run build first)
npm run start:prod

# build
npm run build

# tests
npm run test
npm run test:e2e
```

## Auth API examples

Use `curl` and replace email/password with your values.

### Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"user@example.com","password":"secret123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
```

Save `accessToken` and `refreshToken` from the response.

### Current user (requires access token)

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### Refresh access token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

### Logout (revokes refresh token in DB)

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

## Auth endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | public |
| POST | `/auth/logout` | public (`refreshToken` in body) |
| POST | `/auth/forgot-password` | public |
| POST | `/auth/reset-password` | public |
| GET | `/auth/me` | Bearer access token |

## Nannies API examples

### Public catalog (no auth)

```bash
curl "http://localhost:3000/nannies?page=1&limit=4&filter=all"
```

### Nanny details with reviews (auth required)

```bash
curl http://localhost:3000/nannies/<nannyId> \
  -H "Authorization: Bearer <accessToken>"
```

### Favorite nannies list (auth required)

Returns `{ "data": [...] }` — same nanny shape as the public catalog.

```bash
curl http://localhost:3000/nannies/favorites \
  -H "Authorization: Bearer <accessToken>"
```

### Toggle favorite (auth required)

Use this for the heart/star icon on the frontend. One endpoint adds or removes the nanny and returns the new state.

```bash
curl -X PATCH http://localhost:3000/nannies/<nannyId>/favorite \
  -H "Authorization: Bearer <accessToken>"
```

Response:

```json
{ "isFavorite": true }
```

Call the same endpoint again to remove:

```json
{ "isFavorite": false }
```

## Nannies endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/nannies` | public | Paginated nanny list (no reviews) |
| GET | `/nannies/favorites` | Bearer token | User's favorite nannies |
| GET | `/nannies/:id` | Bearer token | Nanny details with reviews |
| PATCH | `/nannies/:id/favorite` | Bearer token | Toggle favorite on/off |

## Frontend favorites flow

1. After login, store `accessToken`.
2. On the favorites page, load `GET /nannies/favorites` and render `response.data`.
3. On icon click, call `PATCH /nannies/:id/favorite` and update UI from `isFavorite`.
4. Optionally keep a `Set` of favorite IDs in state, initialized from `GET /nannies/favorites`.
