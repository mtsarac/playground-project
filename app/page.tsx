// File: app/page.tsx

import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { getUser } from "@/lib/db/queries";

export default async function HomePage() {
  const user = await getUser();
  return (
    <>
      <main className="flex flex-col items-center justify-between gap-8 p-24 text-3xl">
        <h1>Welcome to the Home Page</h1>
        {user ? (
          <div>
            <p className="mb-4 text-lg">You are logged in as {user.username}</p>
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
              >
                Logout
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row">
            <LoginForm />
            <RegisterForm />
          </div>
        )}
      </main>
    </>
  );
}
