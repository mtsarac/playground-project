// File: app/api/(auth)/logout/route.ts
import { NextRequest } from "next/server";
import { clearSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function POST(_req: NextRequest) {
  await clearSession();
  redirect("/");
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
