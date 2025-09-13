import { type NextRequest, NextResponse } from "next/server";

export default async function handler(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const validPaths = ["/about", "/contact", "/api"];

  return NextResponse.next();
}
