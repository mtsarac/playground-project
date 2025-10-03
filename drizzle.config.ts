// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

/**
 * DATABASE_URL from env so the same config works:
 * - Host machine (local dev):   postgresql://...@localhost:5431/PlaygroundDb
 * - Inside containers:          postgresql://...@db:5432/PlaygroundDb
 */
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("Missing DATABASE_URL for drizzle-kit");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
  // optional: verbose logs to debug
  // verbose: true,
  // strict: true,
});
