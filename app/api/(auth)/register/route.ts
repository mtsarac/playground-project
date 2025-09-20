// File: app/api/(auth)/register/route.ts
import type { NextRequest } from "next/server";
import { safeParseAsync } from "zod";
import { register } from "@/lib/auth/auth";
import apiResponse, { registerSchema } from "@/lib/api-tools";
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
          error: "Too many register attempts. Please try again later.",
          ok: false,
        },
        { status: 429, statusText: "Too Many Requests" }
      );
    }

    const body = await request.json();

    // Verify CSRF token
    const csrfToken = request.headers.get("x-csrf-token") || body.csrfToken;
    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return apiResponse(
        { error: "Invalid CSRF token" },
        { status: 403, statusText: "Forbidden" }
      );
    }
    const parseResult = await safeParseAsync(registerSchema, body);
    if (!parseResult.success) {
      return apiResponse(
        {
          ok: false,
          message: "Invalid Input",
          error: parseResult.error.issues[0].message, // Returns first error cause
        },
        {
          status: 400,
          statusText: "Invalid Input",
        }
      );
    }

    const { email, password, username } = parseResult.data;

    const { id } = await register(
      username,
      email,
      password,
      ipAddress,
      userAgent
    );
    return apiResponse(
      { message: "User succesfully created", ok: true, other: id },
      { status: 201, statusText: "Success" }
    );
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : String(error) || "Something went wrong";
    const statusCode = msg === "Email already in use." ? 409 : 500;
    return apiResponse(
      {
        error: msg,
      },
      {
        status: statusCode,
      }
    );
  }
}
