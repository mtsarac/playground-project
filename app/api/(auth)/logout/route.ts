// File: app/api/(auth)/logout/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/auth/session";

export async function POST(_req: NextRequest) {
  await clearSession();
  return new NextResponse(null, { status: 302, headers: { Location: "/" } });
}
