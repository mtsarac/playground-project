"use client";
import RegisterDialog from "./register-dialog";
import LoginDialog from "./login-dialog";
import { useState } from "react";

type AuthButtonProps = {
  type: "login" | "register";
};

export default function AuthButton(props: AuthButtonProps) {
  const [modal, setModal] = useState(false);
  const isLogin = props.type === "login";
  return (
    <div className="w-full">
      {isLogin ? (
        <LoginDialog open={modal} onOpenChange={setModal} />
      ) : (
        <RegisterDialog open={modal} onOpenChange={setModal} />
      )}
    </div>
  );
}
