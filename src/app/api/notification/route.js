import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  // Initialize Supabase client
  const supabaseUrl = "https://ugnqtphzgygdfzenwzfu.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbnF0cGh6Z3lnZGZ6ZW53emZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzcyOTY4NywiZXhwIjoyMDUzMzA1Njg3fQ.XOcdktgh9I6tNunz8V2zplHDKHjLng_2ijwtji2de_g";

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are not set");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { product } = await request.json();

    if (!product || !product._id || !product.name) {
      return NextResponse.json(
        { message: "Invalid product data" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users:", error.message, error.details);
      return NextResponse.json(
        { message: "Error fetching users", details: error.message },
        { status: 500 }
      );
    }

    if (!data || !data.users || data.users.length === 0) {
      console.log("No users found in the database");
      return NextResponse.json({ message: "No users found" }, { status: 204 });
    }

    const notificationPromises = data.users.map(async (user) => {
      const { error } = await supabase.from("notifications").insert([
        {
          id: user.id, // Use the user's id for both id and user_id
          user_id: user.id,
          message: `New product added: ${product.name}`,
          product_id: product._id,
          read: false,
        },
      ]);

      if (error) {
        console.error(
          "Error inserting notification:",
          error.message,
          error.details
        );
        return false;
      }
      return true;
    });

    const results = await Promise.all(notificationPromises);
    const allSuccessful = results.every(Boolean);

    if (allSuccessful) {
      return NextResponse.json(
        { message: "Notifications sent successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Some notifications failed to send" },
        { status: 207 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error.message, error.stack);
    return NextResponse.json(
      { message: "An unexpected error occurred", details: error.message },
      { status: 500 }
    );
  }
}
