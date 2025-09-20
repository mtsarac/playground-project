// File: components/auth/login-form.tsx
"use client";
import { Button } from "@/components/ui/button";
import type { loginFormType } from "@/lib/api-tools";
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
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
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (props.open) {
      fetch("/api/csrf-token")
        .then((res) => res.json())
        .then((data) => setCsrfToken(data.csrfToken))
        .catch((error) => {
          console.error("Failed to fetch CSRF token:", error);
          toast.error("Security initialization failed. Please try again.");
        });
    } else {
      setCsrfToken("");
      setIsLoading(false);
    }
  }, [props.open]);

  // ✅ FIXED: Consistent async handling and loading states
  const handleSubmit = async (data: loginFormType) => {
    if (!csrfToken) {
      toast.error("Security token missing. Please refresh and try again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ ...data, csrfToken }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Logged in successfully!");
        props.onOpenChange?.(false);
        setCsrfToken("");
        router.refresh();
      } else {
        toast.error(result.error || "Login failed. Please try again.");
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
