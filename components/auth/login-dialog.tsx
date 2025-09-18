// File: components/auth/login-form.tsx
"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

export const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Invalid password"),
});

type LoginDialogProps = PropsWithChildren & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LoginDialog(props: LoginDialogProps) {
  const [csrfToken, setCsrfToken] = useState<string>("");
  const schema = loginFormSchema;
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Fetch CSRF token when dialog opens
  useEffect(() => {
    if (props.open && !csrfToken) {
      fetch("/api/csrf-token")
        .then((res) => res.json())
        .then((data) => setCsrfToken(data.csrfToken))
        .catch((error) => console.error("Failed to fetch CSRF token:", error));
    }
  }, [props.open, csrfToken]);

  function onSubmit(data: z.infer<typeof schema>) {
    if (!csrfToken) {
      toast.error("Security token missing. Please refresh and try again.");
      return;
    }

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ ...data, csrfToken }),
    })
      .then(async (res) => {
        if (res.ok) {
          toast.success("Logged in successfully!");
          props.onOpenChange?.(false);
          form.reset();
          setCsrfToken(""); // Reset token
          router.refresh();
        } else {
          toast.error(`Login failed: ${(await res.json()).error}`);
        }
      })
      .catch((error) => {
        toast.error(`An error occurred: ${error.message}`);
      });
  }

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
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onReset={() => form.reset()}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="demo@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={!csrfToken}>
                  {csrfToken ? "Login" : "Loading..."}
                </Button>
              </div>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
