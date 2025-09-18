// File: app/api/(auth)/logout/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { clearSession, readSession } from "@/lib/auth/session";
import { ActivityType } from "@/lib/db/schema";
import { logActivity } from "@/lib/db/queries";

// POST /api/(auth)/logout
// Logs out the current user by clearing their session and logging the activity

export async function POST(req: NextRequest) {
  // Get current session before clearing it
  const session = await readSession();

  if (session) {
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Log logout activity
    await logActivity(
      session.userId,
      ActivityType.SIGN_OUT,
      ipAddress,
      userAgent,
    );
  }

  await clearSession();
  return new NextResponse(null, { status: 302, headers: { Location: "/" } });
}
