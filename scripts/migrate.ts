// scripts/migrate.ts
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");

  const ssl =
    process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false;

  const pool = new Pool({ connectionString: url, ssl });
  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("✅ Drizzle migrations applied");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
