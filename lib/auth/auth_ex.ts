// File: lib/auth/auth.ts
import { comparePasswords, hashPassword, setSession } from "./session";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function login(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  if (!user) {
    throw new Error("Invaild credentials.");
  }
  const hashedPassword = await hashPassword(password);
  const isPasswordValid = await comparePasswords(
    hashedPassword,
    user[0].passwordHash
  );
  if (!isPasswordValid) {
    throw new Error("Invalid password.");
  }
  return { id: user[0].id };
}
export async function register(
  username: string,
  email: string,
  password: string
) {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  if (existing.length > 0) {
    throw new Error("Email already in use.");
  }
  const hashedPassword = await hashPassword(password);
  const newUser = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      username: username,
      passwordHash: hashedPassword,
    })
    .returning();
  if (newUser.length > 0) {
    setSession(newUser[0]);
    return { id: newUser[0].id };
  } else {
    throw new Error("Failed to create user. Please try again.");
  }
}
