// File: lib/db/queries.ts

import { unstable_noStore as noStore } from "next/cache";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function getUser() {
  "use server";
  noStore();

  const session = await getSession();
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
