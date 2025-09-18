// File: app/page.tsx

import { getUser } from "@/lib/db/queries";
import ActivityLog from "@/components/activity-log";

export default async function HomePage() {
  const user = await getUser();
  return (
    <main className="flex flex-col items-center justify-between gap-8 p-24 text-3xl">
      <h1>Welcome to the Playground</h1>
      {user ? (
        <div>
          <p className="mb-4 text-lg">You are logged in as {user.username}</p>
          <ActivityLog />
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:flex-row"></div>
      )}
    </main>
  );
}
