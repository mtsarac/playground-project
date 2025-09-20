import { NextResponse } from "next/server";
import { getUserActivities } from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    const userId = reqBody.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const activities = await getUserActivities(userId);
    return NextResponse.json({ activities });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
