# Auth server (Express + Prisma)

This is a minimal scaffold for authentication using JWT access tokens and refresh tokens stored in the database.

Quick start

1. Copy `.env.example` to `.env` and set `DATABASE_URL` + secrets.

2. Install dependencies:

```bash
cd server
npm install
```

3. Generate Prisma client and run migration (creates tables):

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run the server in dev mode:

```bash
npm run dev
```

Notes

- Refresh tokens are stored hashed in the `RefreshToken` table.
- Access tokens are JWTs (short lived). Refresh tokens are opaque random strings stored in HttpOnly cookie.
- Adjust CORS origin to match your front-end.
