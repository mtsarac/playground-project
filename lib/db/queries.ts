import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { readSession } from "@/lib/auth/session"; // ⬅️ change import

export async function getUser() {
  const session = await readSession(); // ⬅️ no cookie mutation here
  if (!session) return null;

  const row = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.id, session.userId), isNull(users.deletedAt)))
    .limit(1);

  return row[0] ?? null;
}
