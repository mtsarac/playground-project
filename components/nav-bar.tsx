// File: components/nav-bar.tsx
import { ModeToggle } from "./theme-toggle";
import Link from "next/link";
import { Button } from "./ui/button";
import AuthButton from "./auth/auth-button";
import { getUser } from "@/lib/db/queries";
import { fLetterToUpperCase } from "@/lib/utils";

export default async function Navbar() {
  const user = await getUser();
  type ComponentsType = {
    title: string;
    href: string;
    description: string;
  };
  const components: ComponentsType[] = [
    { title: "Home", href: "/", description: "Go to home page" },
    { title: "About", href: "/about", description: "Learn more about us" },
    { title: "Contact", href: "/contact", description: "Get in touch" },
  ];

  return (
    <nav className=" flex items-center justify-between px-4 py-2 mx-4 mt-4 border-t-2 border-t-muted border-b-2 rounded-2xl border-b-muted ">
      <div className="flex flex-row items-center gap-4">
        {components.map((component) => (
          <Link
            key={component.title}
            href={component.href}
            title={component.description}
            passHref
          >
            <Button
              variant="ghost"
              className="text-lg font-medium cursor-pointer w-16"
            >
              {component.title}
            </Button>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className=" md:flex flex-row items-center gap-2">
            <div className="border-2 border-muted px-2 py-1 rounded-lg hover:bg-accent">
              <div>Welcome to the system</div>
              <div className="font-bold text-lg">
                {fLetterToUpperCase(user.username)}
              </div>
            </div>
            <form action="/api/logout" method="POST">
              <Button variant={"destructive"} type="submit">
                Logout
              </Button>
            </form>
          </div>
        ) : (
          <div className=" md:flex flex-row items-center gap-2">
            <AuthButton type="login" />
            <AuthButton type="register" />
          </div>
        )}
        <ModeToggle />
      </div>
    </nav>
  );
}
