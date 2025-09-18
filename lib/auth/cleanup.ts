// File: lib/auth/cleanup.ts
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { lt } from "drizzle-orm";

// --- cleanup expired sessions ---
// This function can be called periodically (e.g., via a cron job) to clean up expired sessions from the database.
// It deletes all sessions where the expiration time is in the past.
// Returns the number of deleted sessions.

export async function cleanupExpiredSessions(): Promise<{ deleted: number }> {
  const now = new Date();
  const deleted = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, now))
    .returning({ id: sessions.id });

  return { deleted: deleted.length };
}
