"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
    options: {
      data: {
        full_name: formData.get("name"),
      },
    },
  };

  // Pass correct structure to Supabase
  const { data: signupData, error } = await supabase.auth.signUp(data);

  return {
    error: error?.message || "There was an error signing up",
    success: !error,
    data: signupData || null,
  };
}

export async function login(formData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Pass correct structure to Supabase
  const { data: signInData, error } =
    await supabase.auth.signInWithPassword(data);

  return {
    error: error?.message || "Authentication failed",
    success: !error,
    data: signInData || null,
    session: signInData?.session || null,
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function sendPasswordResetEmail(email) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message, success: false };
  }

  return { success: true, data };
}
