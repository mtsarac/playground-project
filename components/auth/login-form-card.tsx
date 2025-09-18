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
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Invalid password"),
});

export default function LoginForm() {
  const schema = loginFormSchema;
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  function onSubmit(data: z.infer<typeof schema>) {
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        if (res.ok) {
          toast.success("Logged in successfully!");
          form.reset();
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
    <div>
      <Card className="flex flex-col gap-6 w-auto sm:w-[400px] border-muted">
        <CardHeader>
          <CardTitle>Login to our app</CardTitle>
        </CardHeader>
        <CardContent className="">
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
                        type="email"
                        placeholder="demo@example.com"
                        autoComplete="on"
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
                        type="password"
                        placeholder="********"
                        autoComplete="on"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <Button type="reset" className="w-full">
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
