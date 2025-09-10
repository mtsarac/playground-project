// File: lib/auth/session.ts
import crypto from "crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

import { compare, hash } from "bcryptjs";

const COOKIE_NAME = "session";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? "12");

// ---------- Password helpers ----------
export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(plain: string, hashed: string) {
  return compare(plain, hashed);
}

// ---------- Session token helpers ----------
function randomToken(bytes = 32) {
  // base64url, tahmin edilmesi zor
  return crypto.randomBytes(bytes).toString("base64url");
}

function hashToken(token: string) {
  // DB'ye sadece hash yazarız
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Sunucu tarafında: session oluştur + cookie ayarla
export async function setSessionForUserId(
  userId: string,
  ttlMs = DEFAULT_TTL_MS
) {
  const rawToken = randomToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + ttlMs);

  await db.insert(sessions).values({
    userId,
    token: tokenHash,
    expiresAt,
    createdAt: new Date(),
  });

  (await cookies()).set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return { token: rawToken, expiresAt };
}

// Mevcut oturumu doğrula (cookie -> DB kontrol)
export async function getSession() {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const tokenHash = hashToken(raw);
  const now = new Date();

  const rows = await db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      user: users, // tüm user kolonları
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.token, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    // geçersiz/expired ise cookie’i temizleyelim
    (await cookies()).delete(COOKIE_NAME);
    return null;
  }

  return {
    sessionId: row.sessionId,
    userId: row.userId,
    expiresAt: row.expiresAt,
    user: row.user, // { id, email, username, role, ... }
  };
}

// Çıkış yap (cookie + DB kaydını sil)
export async function clearSession() {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (raw) {
    const tokenHash = hashToken(raw);
    await db.delete(sessions).where(eq(sessions.token, tokenHash));
  }
  (await cookies()).delete(COOKIE_NAME);
}

// (Opsiyonel) expired session temizliği için job yazabilirsin:
// DELETE FROM sessions WHERE expires_at < now();
