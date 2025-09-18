// File: app/api/(auth)/login/route.ts
import type { NextRequest } from "next/server";
import { safeParseAsync } from "zod";
import { login } from "@/lib/auth/auth";
import apiResponse, { loginFormSchema } from "@/lib/api-tools";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { verifyCSRFToken } from "@/lib/auth/csrf";

export async function POST(request: NextRequest) {
  try {
    // Extract request information for logging
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed) {
      return apiResponse(
        {
          error: "Too many login attempts. Please try again later.",
          ok: false,
        },
        { status: 429, statusText: "Too Many Requests" },
      );
    }

    const body = await request.json();

    // Verify CSRF token
    const csrfToken = request.headers.get("x-csrf-token") || body.csrfToken;
    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return apiResponse(
        { error: "Invalid CSRF token" },
        { status: 403, statusText: "Forbidden" },
      );
    }

    const parseResult = await safeParseAsync(loginFormSchema, body);
    if (!parseResult.success) {
      return apiResponse(
        {
          ok: false,
          message: "Invalid Input",
          error: parseResult.error.issues[0].message,
        },
        { status: 400, statusText: "Invalid Input" },
      );
    }

    const { email, password } = parseResult.data;

    // Pass request info to login function for activity logging
    const { id } = await login(email, password, ipAddress, userAgent);

    return apiResponse(
      { message: "Login success.", ok: true, other: id },
      { status: 200, statusText: "Success" },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    const statusCode = msg === "Invalid credentials" ? 401 : 500;

    return apiResponse({ error: msg }, { status: statusCode });
  }
}
