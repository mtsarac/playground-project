"use client";
import { type PropsWithChildren, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { UserActivity } from "@/lib/db/schema";

export default function ActivityLog() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/activities", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setActivities(data.activities || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch activities:", error);
        setLoading(false);
      });
  }, []);

  const getActivityColor = (activity: string) => {
    if (activity.includes("SIGN_IN")) return "bg-green-100 text-green-800";
    if (activity.includes("SIGN_OUT")) return "bg-blue-100 text-blue-800";
    if (activity.includes("SIGN_UP")) return "bg-purple-100 text-purple-800";
    if (activity.includes("FAILED")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="p-4">Loading activities...</div>;
  }

  return (
    <Card className="w-128">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground">No activities found.</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge className={getActivityColor(activity.activity)}>
                    {activity.activity.replace(/_/g, " ")}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {activity.createdAt &&
                      new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  IP: {activity.ipAddress || "Unknown"}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
