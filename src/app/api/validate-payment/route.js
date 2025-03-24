import { NextResponse } from "next/server";
import axios from "axios";

// Get API key from environment variable
const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const API_BASE_URL = "https://api.nowpayments.io/v1";

export async function POST(request) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { valid: false, error: "Missing payment ID" },
        { status: 400 }
      );
    }

    // Check if this is a valid payment ID with NOWPayments API
    try {
      const response = await axios.get(`${API_BASE_URL}/payment/${paymentId}`, {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      });

      // If we get a valid response, this is a real payment ID
      return NextResponse.json({
        valid: true,
        paymentStatus: response.data.payment_status,
      });
    } catch (apiError) {
      // If NOWPayments API returns an error, this is not a valid payment ID
      console.error("NOWPayments API error:", apiError.message);
      return NextResponse.json({ valid: false });
    }
  } catch (error) {
    console.error("Error validating payment:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
