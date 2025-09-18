import { NextResponse } from "next/server";
import z from "zod";

interface ResponseBody {
  ok?: boolean;
  message?: string;
  error?: string;
  other?: unknown;
}

export default function apiResponse(body: ResponseBody, init?: ResponseInit) {
  const options = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "content-type": "application/json",
    },
  };
  return NextResponse.json(body, options);
}

// Enhanced password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Enhanced username validation
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  )
  .transform((val) => val.toLowerCase());

export const registerSchema = z.object({
  username: usernameSchema,
  email: z
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase()
    .normalize(),
  password: passwordSchema,
});

export const loginFormSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase()
    .normalize(),
  password: z.string().min(1, "Password is required"),
});
