"use client";

import {
  loginFormSchema,
  registerSchema,
  type loginFormType,
  type registerFormType,
} from "@/lib/api-tools";

import { zodResolver } from "@hookform/resolvers/zod";
import type { PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

type FormProps = PropsWithChildren & {
  type: "login" | "register";
  onSubmit: (data: loginFormType | registerFormType) => void;
};

const formSections = {
  login: {
    title: "Login",
    fields: [
      {
        name: "email" as const,
        type: "email",
        placeholder: "example@example.com",
        autoComplete: "email",
      },
      {
        name: "password",
        type: "password",
        placeholder: "********",
        autoComplete: "current-password",
      },
    ] as const,
    buttonText: "Login",
  },
  register: {
    title: "Register",
    fields: [
      {
        name: "username" as const,
        type: "text",
        placeholder: "Username",
        autoComplete: "username",
      },
      {
        name: "email",
        type: "email",
        placeholder: "example@example.com",
        autoComplete: "email",
      },
      {
        name: "password",
        type: "password",
        placeholder: "********",
        autoComplete: "new-password",
      },
    ] as const,
    buttonText: "Register",
  },
};

export default function ReusableAuth({ type, onSubmit }: FormProps) {
  if (type !== "login" && type !== "register") {
    throw new Error("Invalid form type");
  }

  const defaultValues =
    type === "login"
      ? { email: "", password: "" }
      : { username: "", email: "", password: "" };

  const form = useForm<loginFormType | registerFormType>({
    resolver: zodResolver(type === "login" ? loginFormSchema : registerSchema),
    defaultValues,
  });

  const { fields, buttonText } = formSections[type];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={() => form.reset()}
        className="flex flex-col gap-6"
      >
        {fields.map((fieldName) => (
          <FormField
            key={fieldName.name}
            control={form.control}
            name={fieldName.name}
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel className="capitalize">{fieldName.name}</FormLabel>
                <FormControl>
                  <Input
                    id={fieldName.name}
                    type={fieldName.type}
                    placeholder={fieldName.placeholder}
                    autoComplete={fieldName.autoComplete}
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
