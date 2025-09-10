// File: lib/auth/jwt.ts
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { createSecretKey } from "crypto";

const ACCESS_TTL = "15m";
const ISSUER = "your-app";
const AUDIENCE = "your-app-web";

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
    // İstersen minimal tut, role/email koyma — burada payload’a gömmek istersen:
    .sign(key);
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify<AccessClaims>(token, key, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
      clockTolerance: 60, // sn
    });
    return payload; // { sub, iat, exp, ... }
  } catch {
    return null;
  }
}
