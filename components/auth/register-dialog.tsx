// File: components/auth/register-form.tsx
"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useEffect, useState, type PropsWithChildren } from "react";
import ReusableAuth from "./reusable-auth-form";
import type { loginFormType, registerFormType } from "@/lib/api-tools";

type RegisterDialogProps = PropsWithChildren & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function RegisterDialog(props: RegisterDialogProps) {
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (props.open) {
      setIsLoadingToken(true);
      fetch("/api/csrf-token")
        .then((res) => res.json())
        .then((data) => {
          setCsrfToken(data.csrfToken);
          setIsLoadingToken(false);
        })
        .catch((error) => {
          console.error("Failed to fetch CSRF token:", error);
          toast.error("Security initialization failed. Please try again.");
          setIsLoadingToken(false);
        });
    } else {
      setCsrfToken("");
      setIsLoadingToken(false);
      setIsLoading(false);
    }
  }, [props.open]);

  async function onSubmit(data: registerFormType) {
    if (!csrfToken) {
      toast.error("Security token missing. Please refresh and try again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ ...data, csrfToken }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Account created successfully! Welcome aboard! 🎉");
        props.onOpenChange?.(false);
        setCsrfToken("");
        router.refresh();
      } else {
        toast.error(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger asChild>
        <div>
          <Button className="hidden cursor-pointer sm:block">Register</Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Account</DialogTitle>
          <DialogDescription className="mb-4">
            Join us today! Fill in your details to get started.
          </DialogDescription>
        </DialogHeader>

        {isLoadingToken ? (
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Initializing security...
            </div>
          </div>
        ) : (
          <div className="relative">
            <ReusableAuth
              type="register"
              onSubmit={
                onSubmit as (data: registerFormType | loginFormType) => void
              }
            />
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-sm text-muted-foreground">
                  Creating your account...
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
