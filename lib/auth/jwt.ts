// File: lib/auth/jwt.ts
import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { createSecretKey } from "node:crypto";

export const runtime = "nodejs";

// --- constants ---
const ACCESS_TTL = "15m"; // token duration
const ISSUER = "playground";
const AUDIENCE = "playground-web";

// --- secret key ---
const rawSecret = process.env.SESSION_SECRET;
if (!rawSecret) {
  throw new Error("SESSION_SECRET is missing");
}

const key = createSecretKey(Buffer.from(rawSecret, "utf-8"));

// --- types ---
export type AccessClaims = JWTPayload & {
  sub: string; // userId
  role?: string;
  email?: string;
};

type AccessClaimsInput = Pick<AccessClaims, "sub" | "role" | "email">;

// --- sign ---
export async function signAccessToken(
  claims: AccessClaimsInput,
  opts?: { ttl?: string | number },
) {
  return await new SignJWT({
    role: claims.role,
    email: claims.email,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(opts?.ttl ?? ACCESS_TTL)
    .sign(key);
}

// --- verify ---
export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify<AccessClaims>(token, key, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
      clockTolerance: 60,
    });
    return payload;
  } catch {
    return null;
  }
}
