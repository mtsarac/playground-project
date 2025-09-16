// File: lib/auth/auth.ts
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { comparePasswords, hashPassword, setSessionForUserId } from "./session";

function normEmail(e: string) {
  return e.trim().toLowerCase().normalize("NFKC");
}
function normUsername(u: string) {
  return u.trim().replace(/\s+/g, " ").normalize("NFKC");
}

export async function login(email: string, password: string) {
  const normalizedEmail = normEmail(email);

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
  password: string,
) {
  const normalizedEmail = normEmail(email);
  const normalizedUsername = normUsername(username);

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Email already in use.", { cause: "Duplicate mail" });
  }

  const passwordHash = await hashPassword(password);

  const inserted = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      username: normalizedUsername,
      passwordHash,
    })
    .returning();

  const newUser = inserted[0];
  if (!newUser)
    throw new Error("Failed to create user. Please try again.", {
      cause: "Db error",
    });

  await setSessionForUserId(newUser.id);

  return { id: newUser.id };
}
