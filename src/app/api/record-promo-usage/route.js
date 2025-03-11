// src/app/api/record-promo-usage/route.js
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const { promoCode, orderId } = await request.json();
    if (!promoCode) {
      return Response.json(
        { success: false, error: "Missing promo code" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
      return Response.json(
        { success: false, error: error.message || "Error fetching user" },
        { status: 500 }
      );
    }
    const user = data.user;
    if (!user) {
      return Response.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Validate the orderId against UUID format.
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validOrderId = orderId && uuidRegex.test(orderId) ? orderId : null;

    const { data: recordData, error: recordError } = await supabase
      .from("used_promo_codes")
      .insert({
        user_id: user.id,
        promo_code: promoCode,
        used_at: new Date().toISOString(),
        order_id: validOrderId,
      });

    if (recordError) {
      console.error("Error recording promo code usage:", recordError);
      return Response.json(
        { success: false, error: "Failed to record promo code usage" },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error recording promo code usage:", error);
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}