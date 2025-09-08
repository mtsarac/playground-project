import React from "react";
import { ModeToggle } from "./theme-toggle";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex min-h-1/5 items-center justify-between mx-4 my-4 text-3xl">
      <h1 className="flex-1">
        <Link href="/">Welcome to My Next.js App!</Link>
      </h1>
      <ModeToggle />
    </nav>
  );
}
