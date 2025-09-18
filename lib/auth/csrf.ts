import { cookies } from "next/headers";
import { randomToken } from "./session";

const CSRF_COOKIE_NAME = "csrf-token";

export async function generateCSRFToken(): Promise<string> {
  const token = randomToken(32);
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

export async function verifyCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  return storedToken === token;
}
