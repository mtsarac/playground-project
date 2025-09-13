// File: lib/auth/jwt.ts
import { jwtVerify, type JWTPayload, SignJWT } from "jose";
import { createSecretKey } from "node:crypto";

const ACCESS_TTL = "15m";
const ISSUER = "playground";
const AUDIENCE = "playground-web";

const raw = process.env.SESSION_SECRET;
if (!raw) throw new Error("SESSION_SECRET is missing");
const key = createSecretKey(Buffer.from(raw, "utf8"));

export type AccessClaims = JWTPayload & {
  sub: string; // userId
  role?: string;
  email?: string;
};

export async function signAccessToken(claims: {
  sub: string;
  role?: string;
  email?: string;
}) {
  return await new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(key);
}

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
