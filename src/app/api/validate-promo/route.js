// src/app/api/validate-promo/route.js
import { client } from "@/lib/sanity";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const { promoCode } = await request.json();
    if (!promoCode) {
      return Response.json(
        { valid: false, error: "Missing promo code" },
        { status: 400 }
      );
    }

    // Await client creation so that the cookies are properly resolved.
    const supabase = await createClient();

    if (!supabase.auth || typeof supabase.auth.getUser !== "function") {
      throw new Error("Supabase client is not properly initialized.");
    }

    // Get current user from Supabase
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
      return Response.json(
        { valid: false, error: error.message || "Error fetching user" },
        { status: 500 }
      );
    }
    const user = data.user;
    if (!user) {
      return Response.json(
        { valid: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // 1. Fetch promo code details from Sanity
    const promoData = await client.fetch(
      `*[_type == "promoCode" && code == $code][0]{
        _id,
        code,
        discount,
        isPercentage,
        validFrom,
        validTo,
        notificationText
      }`,
      { code: promoCode }
    );

    if (!promoData) {
      return Response.json(
        { valid: false, error: "Invalid promo code" },
        { status: 400 }
      );
    }

    // 2. Validate promo code date constraints
    const now = new Date();
    if (promoData.validFrom && new Date(promoData.validFrom) > now) {
      return Response.json(
        { valid: false, error: "This promo code is not yet valid" },
        { status: 400 }
      );
    }
    if (promoData.validTo && new Date(promoData.validTo) < now) {
      return Response.json(
        { valid: false, error: "This promo code has expired" },
        { status: 400 }
      );
    }

    // 3. Check if the user has already used this promo code
    const { data: usedPromoData, error: usedPromoError } = await supabase
      .from("used_promo_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("promo_code", promoCode)
      .single();

    if (usedPromoError && usedPromoError.code !== "PGRST116") {
      console.error("Error checking used promo codes:", usedPromoError);
      return Response.json(
        { valid: false, error: "Error validating promo code" },
        { status: 500 }
      );
    }

    if (usedPromoData) {
      return Response.json(
        { valid: false, error: "You have already used this promo code" },
        { status: 400 }
      );
    }

    // Promo code is valid – return the promo details
    return Response.json({
      valid: true,
      promoData: {
        code: promoData.code,
        discount: promoData.discount,
        isPercentage: promoData.isPercentage,
        notificationText: promoData.notificationText,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return Response.json(
      { valid: false, error: "Server error" },
      { status: 500 }
    );
  }
}
