# Playground-project

Next.js 16 playground with Drizzle ORM (Neon PostgreSQL), shadcn/ui, JWT auth, and Biome.

## Prerequisites

- [Bun](https://bun.sh/) (package manager and runtime)
- [Neon](https://neon.tech/) PostgreSQL database (or any Postgres-compatible)
- A `.env` file in the project root:

```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="<random min-32-char string>"
DB_SSL="true"
```

## Tech Stack

- **Next.js 16** — App Router, Turbopack
- **Drizzle ORM** — schema, migrations, queries
- **Neon** (PostgreSQL) — serverless Postgres
- **shadcn/ui** — Radix primitives + Tailwind CSS v4
- **Biome** — linting & formatting
- **Zod** — input validation (shared between API + client)
- **Jose** — JWT tokens
- **Vercel** — deployment

## Getting Started

```bash
git clone https://github.com/mtsarac/playground-project.git
cd playground-project
bun install
```

### Database

Run migrations to create tables:

```bash
bun run db:migrate
```

This applies the SQL files in `drizzle/` to create `users`, `sessions`, and `user_activities` tables.

### Dev

```bash
bun run dev     # next dev --turbopack
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

Set these environment variables in your Vercel project dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon connection string |
| `DB_SSL` | `true` |
| `SESSION_SECRET` | random 32+ char string |

Run migrations before deploying (or as a CI step):

```bash
DATABASE_URL="<neon-url>" bun run db:migrate
```

Then deploy normally with `git push` or `bunx vercel --prod`.

## Commands

| Command | Action |
|---------|--------|
| `bun run dev` | Start dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run db:generate` | Generate Drizzle migration from schema |
| `bun run db:migrate` | Apply pending migrations |
| `bun run lint` | Biome check |
| `bun run format` | Biome format --write |
