import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { readSession } from "@/lib/auth/session";

// --- get current user for Server Components ---
// This function retrieves the currently authenticated user's details based on the session cookie.
// It returns the user, or null if no valid session exists.

export async function getUser() {
  const session = await readSession();
  if (!session) return null;

  const userId = session.userId;
  if (!userId) return null;

  const row = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  return row[0] ?? null;
}
