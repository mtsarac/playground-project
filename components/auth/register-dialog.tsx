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
import { useState, type PropsWithChildren } from "react";
import ReusableAuth from "./reusable-auth-form";
import type { loginFormType, registerFormType } from "@/lib/api-tools";

type RegisterDialogProps = PropsWithChildren & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function RegisterDialog(props: RegisterDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingToken] = useState(false);
  const router = useRouter();

  async function onSubmit(data: registerFormType) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Account created successfully! Welcome aboard! 🎉");
        props.onOpenChange?.(false);
        router.refresh();
      } else {
        if ((result.error as string).includes("Failed query"))
          toast.error("Registration failed. Please try again.");
        else
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
