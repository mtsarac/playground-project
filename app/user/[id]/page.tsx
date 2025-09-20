import ActivityLog from "@/components/activity-log";
import { getUser } from "@/lib/db/queries";

export default async function Page({ params }: { params: { id: string } }) {
  await params;
  const user = await getUser();
  return (
    <div>
      {user && (
        <div className="mt-4 flex flex-col gap-y-4 capitalize">
          <h1 className="text-2xl font-bold">Username: {user.username}</h1>
          <p className="">User id: {user.id}</p>
          <p className="">User email: {user.email}</p>
          <p className="">User role: {user.role}</p>
          <ActivityLog />
        </div>
      )}
    </div>
  );
}
