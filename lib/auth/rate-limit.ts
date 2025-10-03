import type { NextRequest } from "next/server";

const attempts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  req: NextRequest,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();

  const userAttempts = attempts.get(ip);

  if (!userAttempts || now > userAttempts.resetTime) {
    attempts.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (userAttempts.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetTime: userAttempts.resetTime };
  }

  userAttempts.count++;
  return { allowed: true, remaining: maxAttempts - userAttempts.count };
}
