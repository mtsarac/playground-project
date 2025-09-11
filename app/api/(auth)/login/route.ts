// File: app/api/(auth)/login/route.ts
import type { NextRequest } from "next/server";
import { z } from "zod";
import { login } from "@/lib/auth/auth";

const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginFormSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          message: "Invalid input",
          errors: parsed.error,
        }),
        { status: 400, headers: { "content-type": "application/json" } },
      );
    }

    const { email, password } = parsed.data;
    const { id } = await login(email, password);
    return new Response(JSON.stringify({ ok: true, userId: id }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    // biome-ignore lint/suspicious/noExplicitAny: intentional usage
  } catch (err: any) {
    const msg = err?.message ?? "Something went wrong";
    const status = msg === "Invalid credentials." ? 401 : 500;
    return new Response(JSON.stringify({ message: msg }), {
      status,
      headers: { "content-type": "application/json" },
    });
  }
}
