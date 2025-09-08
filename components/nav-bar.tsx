import React from "react";
import { ModeToggle } from "./theme-toggle";

export default function Navbar() {
  return (
    <nav className="flex min-h-1/5 items-center justify-between mx-4 my-4 text-3xl">
      <h1 className="flex-1">Welcome to My Next.js App!</h1>
      <ModeToggle />
    </nav>
  );
}
