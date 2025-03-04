import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  console.log("Webhook received");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are not set");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const payload = await request.json();
    console.log("Received payload:", payload);

    let itemData;
    let itemType;

    if (payload._type === "product") {
      itemData = payload;
      itemType = "product";
    } else if (payload._type === "productVariant") {
      // Add handling for productVariant updates
      itemData = payload;
      itemType = "productVariant";
    } else if (payload._type === "promoCode") {
      itemData = payload;
      itemType = "promoCode";
    } else {
      console.error("Unknown payload structure:", payload);
      return NextResponse.json(
        { message: "Invalid data structure" },
        { status: 400 }
      );
    }

    if (!itemData || !itemData._id) {
      return NextResponse.json(
        { message: "Invalid item data" },
        { status: 400 }
      );
    }

    const { data: usersData, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) {
      console.error(
        "Error fetching users:",
        userError.message,
        userError.details
      );
      return NextResponse.json(
        { message: "Error fetching users", details: userError.message },
        { status: 500 }
      );
    }

    if (!usersData || !usersData.users || usersData.users.length === 0) {
      console.log("No users found in the database");
      return NextResponse.json({ message: "No users found" }, { status: 204 });
    }

    const users = usersData.users;

    let message;
    if (itemType === "product") {
      message = `New product added: ${itemData.name}`;
    } else if (itemType === "productVariant") {
      // Handle productVariant notifications
      const availableLinks = (itemData.downloadLinks || []).filter(
        (link) => !link.isUsed
      ).length;
      if (availableLinks > 0) {
        message = `New download links available for: ${itemData.name}`;
      } else {
        // Don't send notification if no new links are available
        return NextResponse.json(
          { message: "No new links to notify about" },
          { status: 200 }
        );
      }
    } else if (itemType === "promoCode") {
      message =
        itemData.notificationText || `New promo code added: ${itemData.code}`;
    }

    const notificationPromises = users.map(async (user) => {
      const notificationData = {
        user_id: user.id,
        message,
        read: false,
        email: user.email,
        product_id: itemType === "product" ? itemData._id : null,
        variant_id: itemType === "productVariant" ? itemData._id : null,
        promo_code_id: itemType === "promoCode" ? itemData._id : null,
      };

      const { error: insertError } = await supabase
        .from("notifications")
        .insert([notificationData]);

      if (insertError) {
        console.error(
          "Error inserting notification:",
          insertError.message,
          insertError.details
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
