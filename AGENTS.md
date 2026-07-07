# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-07 22:49 +03
**Commit:** 1df48d9
**Branch:** main

## OVERVIEW

Next.js 16 personal playground app with Drizzle ORM (PostgreSQL), shadcn/ui, and JWT session auth. Bun package manager, Biome lint/format.

## STRUCTURE

```
./
├── app/              # Next.js App Router — pages (about, contact, user/[id]) + API routes
├── components/       # shadcn/ui primitives (27) + auth dialogs (login, register) + nav/clock/theme
├── hooks/            # use-mobile only
├── lib/              # Business logic
│   ├── auth/         #   JWT, sessions, CSRF, rate-limit, password reset
│   ├── db/           #   Drizzle schema (users, sessions, user_activities) + queries + connection
│   ├── api-tools.ts  #   Response helpers + Zod validation schemas
│   ├── config.ts     #   Env validation via Zod
│   └── utils.ts      #   cn(), fLetterToUpperCase()
├── scripts/          # migrate.ts (Drizzle migrations runner)
├── drizzle/          # SQL migration files
├── public/           # Static assets
├── Dockerfile        # Multi-stage (deps → builder → migrations → runner)
└── docker-compose.yaml
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add/edit page | `app/<page>/page.tsx` |
| Add API route | `app/api/<route>/route.ts` |
| Add DB table/column | `lib/db/schema.ts` + generate migration |
| Auth logic (login/register) | `lib/auth/auth.ts` |
| Session management | `lib/auth/session.ts` |
| JWT tokens | `lib/auth/jwt.ts` |
| CSRF protection | `lib/auth/csrf.ts` |
| Rate limiting | `lib/auth/rate-limit.ts` |
| DB queries (getUser, activities) | `lib/db/queries.ts` |
| Form validation schemas | `lib/api-tools.ts` |
| Auth UI components | `components/auth/` |
| Environment vars | `lib/config.ts` + `.env` |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `users` | pgTable | lib/db/schema.ts | Users table (id, email, username, passwordHash, role, soft delete) |
| `sessions` | pgTable | lib/db/schema.ts | Sessions table (userId, token hash, expiresAt) |
| `userActivities` | pgTable | lib/db/schema.ts | Activity log (userId, activity, ip, userAgent) |
| `db` | drizzle instance | lib/db/index.ts | PG Pool-backed drizzle client |
| `signAccessToken` | fn | lib/auth/jwt.ts | HS256 JWT sign (15m TTL) |
| `verifyAccessToken` | fn | lib/auth/jwt.ts | HS256 JWT verify |
| `readSession` | fn | lib/auth/session.ts | Read session from cookie → DB lookup |
| `setSessionForUserId` | fn | lib/auth/session.ts | Create session cookie + DB row |
| `clearSession` | fn | lib/auth/session.ts | Delete session cookie + DB row |
| `login`/`register` | fn | lib/auth/auth.ts | Auth logic with activity logging |
| `apiResponse` | fn | lib/api-tools.ts | JSON response wrapper |
| `checkRateLimit` | fn | lib/auth/rate-limit.ts | In-memory IP-based rate limiting |
| `cleanupExpiredSessions` | fn | lib/auth/cleanup.ts | Remove expired sessions |
| `getUser` | fn | lib/db/queries.ts | Get current user from session |
| `RootLayout` | component | app/layout.tsx | ThemeProvider + Navbar + Toaster + SpeedInsights |
| `Navbar` | component | components/nav-bar.tsx | Server component, renders auth state |
| `ActivityLog` | component | components/activity-log.tsx | Fetches and displays user activity |

## CONVENTIONS

- **Biome** for lint/format (2-space indent). `organizeImports: off` — use manual.
- **Path aliases**: `@/` → root (`./*`). Always use `@/` imports, never relative.
- **Zod schemas** in `lib/api-tools.ts` for all input validation. Shared between API routes and client forms.
- **API routes**: `POST` for mutations, `GET` for reads, `apiResponse()` helper for JSON.
- **"use client"** only on interactive components. Server components by default.
- **shadcn/ui**: Components in `components/ui/`, customized Radix primitives with `data-slot`.
- **JWT** via `jose` library (Edge-compatible), sessions via cookie + DB hash.
- **CSRF**: Generate token on dialog open, send via `X-CSRF-Token` header.
- **DB**: Drizzle ORM with node-postgres. Connection via `lib/db/index.ts`.

## ANTI-PATTERNS

- `as any` / `@ts-ignore` — never. Use proper types.
- Empty catch blocks — always handle or rethrow.
- Direct `process.env` access — use `lib/config.ts` `env` export.
- Inline validation in route handlers — use Zod schemas from `lib/api-tools.ts`.
- Using `npm` — project uses Bun.

## UNIQUE STYLES

- **Soft delete** on `users.deletedAt` (nullable timestamp).
- **Activity logging** on every auth action (SIGN_IN, SIGN_OUT, SIGN_UP, failures).
- **Rate limiting**: In-memory Map (volatile, not shared across instances). Acceptable for single-process dev/playground.
- **Reset tokens**: In-memory Map, not DB — 1-hour TTL, lost on restart.
- **Session tokens**: SHA-256 hash stored in DB; raw token in httpOnly cookie. Cookie set server-side via `next/headers`.

## COMMANDS

```bash
bun run dev          # next dev --turbopack
bun run build        # next build
bun run db:generate  # drizzle-kit generate
bun run db:migrate   # tsx scripts/migrate.ts
bun run lint         # biome check
bun run format       # biome format --write
```

## NOTES

- **No tests exist** — project is a personal playground.
- `.env` needs `DATABASE_URL` (PostgreSQL) and `SESSION_SECRET` (min 32 chars).
- `lib/actions.ts` is empty — not used.
