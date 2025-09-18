// File: app/api/(auth)/register/route.ts
import type { NextRequest } from "next/server";
import { safeParseAsync } from "zod";
import { register } from "@/lib/auth/auth";
import apiResponse, { registerSchema } from "@/lib/api-tools";
import { checkRateLimit } from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed) {
      return apiResponse(
        {
          error: "Too many login attempts. Please try again later.",
          ok: false,
        },
        { status: 429, statusText: "Too Many Requests" }
      );
    }

    const body = await request.json();
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

    const { id } = await register(username, email, password);
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
