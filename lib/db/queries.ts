// File: lib/db/queries.ts
import { and, eq, isNull, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, userActivities } from "@/lib/db/schema";
import { readSession } from "@/lib/auth/session";

// --- get current user for Server Components ---

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

// Get user activity history
export async function getUserActivities(userId?: string, limit = 50) {
  const session = await readSession();
  if (!session && !userId) return [];

  const targetUserId = userId || session?.userId;
  if (!targetUserId) return [];

  const activities = await db
    .select({
      id: userActivities.id,
      activity: userActivities.activity,
      ipAddress: userActivities.ipAddress,
      userAgent: userActivities.userAgent,
      createdAt: userActivities.createdAt,
    })
    .from(userActivities)
    .where(eq(userActivities.userId, targetUserId))
    .orderBy(desc(userActivities.createdAt))
    .limit(limit);

  return activities;
}

// Get activity statistics
export async function getActivityStats(userId?: string) {
  const session = await readSession();
  if (!session && !userId) return null;

  const targetUserId = userId || session?.userId;
  if (!targetUserId) return null;

  const stats = await db
    .select({
      activity: userActivities.activity,
      count: sql<number>`count(*)`,
    })
    .from(userActivities)
    .where(eq(userActivities.userId, targetUserId))
    .groupBy(userActivities.activity);

  return stats;
}

// Get recent login attempts (for security monitoring)
export async function getRecentLoginAttempts(limit = 20) {
  const activities = await db
    .select({
      id: userActivities.id,
      userId: userActivities.userId,
      activity: userActivities.activity,
      ipAddress: userActivities.ipAddress,
      createdAt: userActivities.createdAt,
      username: users.username,
      email: users.email,
    })
    .from(userActivities)
    .innerJoin(users, eq(users.id, userActivities.userId))
    .where(sql`${userActivities.activity} LIKE '%SIGN_IN%'`)
    .orderBy(desc(userActivities.createdAt))
    .limit(limit);

  return activities;
}
export async function logActivity(
  userId: string,
  activity: string,
  ipAddress?: string,
  userAgent?: string
) {
  await db.insert(userActivities).values({
    userId,
    activity,
    ipAddress,
    userAgent,
  });
}
