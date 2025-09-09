import React from "react";
import { ModeToggle } from "./theme-toggle";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu";

export default function Navbar() {
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
    <nav className=" flex items-center justify-between px-4 py-2 mx-4 mt-4 border-t-2 border-t-gray-800 border-b-2 rounded-2xl border-b-gray-800 ">
      <div>
        {components.map((component) => (
          <Link key={component.title} href={component.href} passHref>
            <Button
              variant="ghost"
              className="text-lg font-medium cursor-pointer w-30"
            >
              {component.title}
            </Button>
          </Link>
        ))}
      </div>

      <ModeToggle />
    </nav>
  );
}
