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

/// Schemas

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(120)
    .trim()
    .toLowerCase()
    .normalize(),
  email: z.email().trim().toLowerCase().normalize(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export const loginFormSchema = z.object({
  email: z.email().trim().toLowerCase().normalize(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
