import { NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/auth/csrf";

export async function GET() {
  try {
    const token = await generateCSRFToken();
    return NextResponse.json({ csrfToken: token });
  } catch (error) {
    console.error("[CSRF] Failed to generate token:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 },
    );
  }
}
