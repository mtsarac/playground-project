// File: lib/auth/session.ts
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

import { compare, hash } from "bcryptjs";

const COOKIE_NAME = "session";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const SALT_ROUNDS = 12;

// ---------- Password helpers ----------
export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(plain: string, hashed: string) {
  return compare(plain, hashed);
}

// ---------- Session token helpers ----------
function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
// --- read-only session for Server Components ---
export async function readSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const tokenHash = hashToken(raw);
  const now = new Date();

  const rows = await db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.token, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    sessionId: row.sessionId,
    userId: row.userId,
    expiresAt: row.expiresAt,
    user: row.user,
  };
}

export async function setSessionForUserId(
  userId: string,
  ttlMs = DEFAULT_TTL_MS
) {
  const cookieStore = await cookies();
  const rawToken = randomToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + ttlMs);

  const queryResult = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId));
  if (queryResult.length > 0) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  await db.insert(sessions).values({
    userId,
    token: tokenHash,
    expiresAt,
    createdAt: new Date(),
  });

  cookieStore.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return { token: rawToken, expiresAt };
}

export async function clearSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (raw) {
    const tokenHash = hashToken(raw);
    await db.delete(sessions).where(eq(sessions.token, tokenHash));
  }
  cookieStore.delete(COOKIE_NAME);
}
