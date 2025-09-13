import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true",
});
/**
 * The `db` instance provides access to the database using drizzle-orm and the defined schema.
 * Use this instance to perform queries and mutations on the PostgreSQL database.
 */
export const db = drizzle(pool, { schema });
