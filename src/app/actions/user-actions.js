"use server";

import { createClient } from "@/utils/supabase/client";
import { cookies } from "next/headers";

export async function updateEmail(formData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const newEmail = formData.get("email");
  const password = formData.get("password");

  try {
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) throw error;

    return {
      success: true,
      message:
        "Email updated successfully. Please verify your new email address.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}
