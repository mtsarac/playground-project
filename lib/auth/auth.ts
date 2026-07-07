// File: lib/auth/auth.ts
import { db } from "@/lib/db";
import { users, ActivityType } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import {
  comparePasswords,
  hashPassword,
  randomToken,
  setSessionForUserId,
} from "./session";

function normEmail(e: string) {
  return e.trim().toLowerCase().normalize("NFKC");
}

function normUsername(u: string) {
  return u.trim().replace(/\s+/g, " ").normalize("NFKC");
}

export async function login(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const normalizedEmail = normEmail(email);

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  const user = rows[0];

  if (!user) {
    throw new Error("Invalid credentials.");
  }

  const isPasswordValid = await comparePasswords(password, user.passwordHash);
  if (!isPasswordValid) {
    await logActivity(
      user.id,
      `${ActivityType.SIGN_IN}_FAILED`,
      ipAddress,
      userAgent,
    );
    throw new Error("Invalid credentials.");
  }

  await setSessionForUserId(user.id);

  await logActivity(user.id, ActivityType.SIGN_IN, ipAddress, userAgent);

  return { id: user.id };
}

export async function register(
  username: string,
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
) {
  console.log("[register] Starting registration for:", email);

  const normalizedEmail = normEmail(email);
  const normalizedUsername = normUsername(username);

  console.log("[register] Checking for existing user with email:", normalizedEmail);
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    console.log("[register] Email already in use:", normalizedEmail);
    throw new Error("Email already in use.", { cause: "Duplicate mail" });
  }

  console.log("[register] Hashing password...");
  const passwordHash = await hashPassword(password);

  console.log("[register] Inserting user into DB...");
  try {
    const inserted = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
      })
      .returning();

    const newUser = inserted[0];
    if (!newUser) {
      console.error("[register] DB insert returned no rows");
      throw new Error("Failed to create user. Please try again.", {
        cause: "Db error",
      });
    }

    console.log("[register] User created with id:", newUser.id);
    console.log("[register] Creating session...");
    await setSessionForUserId(newUser.id);

    // Log successful registration
    console.log("[register] Logging SIGN_UP activity...");
    await logActivity(newUser.id, ActivityType.SIGN_UP, ipAddress, userAgent);

    console.log("[register] Registration complete for:", newUser.id);
    return { id: newUser.id };
  } catch (err) {
    // Catch DB/insert errors specifically
    if (err instanceof Error && err.message.startsWith("Failed to create")) throw err;
    console.error("[register] DB operation failed:", err);
    throw new Error("Failed to create user. Please try again.", {
      cause: err instanceof Error ? err.message : String(err),
    });
  }
}
const resetTokens = new Map<string, { userId: string; expires: number }>();

export async function generatePasswordResetToken(
  email: string,
): Promise<string | null> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;

  const token = randomToken(32);
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour

  resetTokens.set(token, { userId: user.id, expires });

  return token;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<boolean> {
  const tokenData = resetTokens.get(token);

  if (!tokenData || Date.now() > tokenData.expires) {
    resetTokens.delete(token);
    return false;
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, tokenData.userId));

  resetTokens.delete(token);
  return true;
}
