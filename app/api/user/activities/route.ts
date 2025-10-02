import { NextResponse } from "next/server";
import { getUserActivities } from "@/lib/db/queries";

export async function GET(_request: Request) {
  try {
    const activities = await getUserActivities();
    return NextResponse.json({ activities });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}
