// File: lib/auth/auth.ts
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { comparePasswords, hashPassword, setSessionForUserId } from "./session";

export async function login(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  const user = rows[0];

  if (!user) throw new Error("Invalid credentials.");

  const isPasswordValid = await comparePasswords(password, user.passwordHash);
  if (!isPasswordValid) throw new Error("Invalid credentials.");

  await setSessionForUserId(user.id);

  return { id: user.id };
}

export async function register(
  username: string,
  email: string,
  password: string
) {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Email already in use.");
  }

  const passwordHash = await hashPassword(password);

  const inserted = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      username,
      passwordHash,
    })
    .returning();

  const newUser = inserted[0];
  if (!newUser) throw new Error("Failed to create user. Please try again.");

  await setSessionForUserId(newUser.id);

  return { id: newUser.id };
}
