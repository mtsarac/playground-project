// File: components/auth/login-form.tsx
"use client";
import { Button } from "@/components/ui/button";
import type { loginFormType } from "@/lib/api-tools";
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import ReusableAuth from "./reusable-auth-form";

type LoginDialogProps = PropsWithChildren & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LoginDialog(props: LoginDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: loginFormType) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Logged in successfully!");
        props.onOpenChange?.(false);
        router.refresh();
      } else {
        if ((result.error as string).includes("Failed query"))
          toast.error("Login failed. Please try again.");
        else toast.error(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger asChild>
        <div>
          <Button className="hidden cursor-pointer sm:block">Login</Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription className="mb-4">
            Enter your email and password to login.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <ReusableAuth type="login" onSubmit={handleSubmit} />
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md">
              <div className="text-sm text-muted-foreground">
                Signing you in...
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
