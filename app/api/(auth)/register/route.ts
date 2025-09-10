// File: app/api/(auth)/register/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { register } from "@/lib/auth/auth";

const registerSchema = z.object({
  username: z.string().min(3).max(120),
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          message: "Invalid input",
          errors: parsed.error,
        }),
        { status: 400, headers: { "content-type": "application/json" } },
      );
    }

    const { username, email, password } = parsed.data;
    const { id } = await register(username, email, password);

    return new Response(JSON.stringify({ ok: true, userId: id }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    const msg = err?.message ?? "Something went wrong";
    const status = msg === "Email already in use." ? 409 : 500;
    return new Response(JSON.stringify({ message: msg }), {
      status,
      headers: { "content-type": "application/json" },
    });
  }
}
