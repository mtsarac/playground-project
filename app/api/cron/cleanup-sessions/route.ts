// File: app/api/cron/cleanup-sessions/route.ts
import { NextResponse } from "next/server";
import { cleanupExpiredSessions } from "@/lib/auth/cleanup";

export const runtime = "nodejs";

export async function POST() {
  const { deleted } = await cleanupExpiredSessions();
  return NextResponse.json({ ok: true, deleted });
}
