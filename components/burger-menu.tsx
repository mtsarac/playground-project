"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import LoginDialog from "./auth/login-dialog";
import RegisterDialog from "./auth/register-dialog";
import { type PropsWithChildren, useState } from "react";
import { Button } from "./ui/button";

type UserType = {
  id: string;
  email: string;
  username: string;
  role: string;
};
type BurgerMenuProps = PropsWithChildren & {
  user?: UserType | null;
};

export default function BurgerMenu(props: BurgerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <div className="">
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Menu className="cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-col items-center">
          {props.user ? (
            <>
              {" "}
              <DropdownMenuItem className="w-full justify-center">
                Hello, {props.user.username}!
              </DropdownMenuItem>
              <DropdownMenuItem>
                <form action="/api/logout" method="post">
                  <Button
                    variant={"destructive"}
                    type="submit"
                    className="w-full text-left"
                  >
                    Logout
                  </Button>
                </form>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                className="w-full justify-center cursor-pointer"
                onClick={() => {
                  setLoginOpen(true);
                  setMenuOpen(false);
                }}
              >
                Login
              </DropdownMenuItem>
              <DropdownMenuItem
                className="w-full justify-center cursor-pointer"
                onClick={() => {
                  setRegisterOpen(true);
                  setMenuOpen(false);
                }}
              >
                Register
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </div>
  );
}
