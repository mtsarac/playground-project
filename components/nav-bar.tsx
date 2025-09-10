"use client";
import { useEffect } from "react";
import { ModeToggle } from "./theme-toggle";
import Link from "next/link";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export default function Navbar() {
  useEffect(() => {
    fetch("/api/test")
      .then((res) => res.json())
      .then((data) => {
        toast.success(data.message);
      })
      .catch((err) => {
        toast.error("API request failed", { description: err.message });
        redirect("/");
      });
  }, []);
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
          <Link key={component.title} href={component.href} passHref>
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
        <div className=" md:flex flex-row items-center gap-2">
          <Button>Login</Button>
          <Button>Register</Button>
        </div>
        <ModeToggle />
      </div>
    </nav>
  );
}
