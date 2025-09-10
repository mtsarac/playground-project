import { db } from "@/lib/db";

export async function GET() {
  if (!db) {
    return new Response(JSON.stringify({ message: "Database not connected" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ message: "API is working!" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
