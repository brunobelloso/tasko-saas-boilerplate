"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { absoluteUrl } from "@/lib/utils";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function register(values: z.infer<typeof registerSchema>) {
  const validated = registerSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, password } = validated.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Email already in use" };
    }
    return { error: error.message };
  }

  return { success: "Account created! Please check your email to confirm." };
}

export async function login(values: { email: string; password: string }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    return { error: "Invalid email or password" };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPassword(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: absoluteUrl("/auth/callback?next=/reset-password"),
  });

  if (error) {
    return { error: "Something went wrong. Please try again." };
  }

  return { success: "If an account exists, a reset link has been sent." };
}

export async function resetPassword(password: string) {
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password has been reset. You can now sign in." };
}
