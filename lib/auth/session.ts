// File: lib/auth/session.ts
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { compare, hash } from "bcryptjs";

const COOKIE_NAME = "session";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const SALT_ROUNDS = 12;

/** ------------ Password helpers ------------ */
export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}
export async function comparePasswords(plain: string, hashed: string) {
  return compare(plain, hashed);
}

/** ------------ Web Crypto helpers (Edge-safe) ------------ */
const enc = new TextEncoder();

function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  const bytes = new Uint8Array(digest);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** ------------ Read-only session for Server Components ------------ */
export async function readSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const tokenHash = await sha256Hex(raw);
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
  if (!row) return null;

  return {
    sessionId: row.sessionId,
    userId: row.userId,
    expiresAt: row.expiresAt,
    user: row.user,
  };
}

/** Create/replace a session for a user and set cookie. */
export async function setSessionForUserId(
  userId: string,
  ttlMs = DEFAULT_TTL_MS
) {
  const cookieStore = await cookies();

  const rawToken = randomToken(32); // 64 char hex
  const tokenHash = await sha256Hex(rawToken); // SHA-256 hex
  const now = Date.now();
  const expiresAt = new Date(now + ttlMs);

  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.insert(sessions).values({
    userId,
    token: tokenHash,
    expiresAt,
    createdAt: new Date(now),
  });

  cookieStore.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: Math.floor(ttlMs / 1000),
  });

  return { token: rawToken, expiresAt };
}

export async function clearSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (raw) {
    const tokenHash = await sha256Hex(raw);
    await db.delete(sessions).where(eq(sessions.token, tokenHash));
  }
  cookieStore.delete(COOKIE_NAME);
}
