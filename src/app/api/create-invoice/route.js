import { NextResponse } from "next/server";
import axios from "axios";

// Get API key from environment variable instead of hardcoding
const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const API_BASE_URL = "https://api.nowpayments.io/v1";

export async function POST(request) {
  try {
    // Validate request body
    const { price_amount, order_id, order_description, customer_email } =
      await request.json();

    if (!price_amount || !order_id) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: price_amount and order_id are required",
        },
        { status: 400 }
      );
    }

    // Ensure price_amount is a valid number
    const amount = Number(price_amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid price_amount: must be a positive number" },
        { status: 400 }
      );
    }

    // Get the base URL from environment variables
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
      console.error(
        "Missing NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL environment variable"
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create the invoice
    const response = await axios.post(
      `${API_BASE_URL}/invoice`,
      {
        price_amount: amount,
        price_currency: "usd",
        order_id,
        order_description: order_description || `Order ${order_id}`,
        ipn_callback_url: `${baseUrl}/api/nowpayments-webhook`,
        success_url: `${baseUrl}/payment-success`,
        cancel_url: `${baseUrl}/cart`,
        partially_paid_url: `${baseUrl}/payment-partial`,
        ...(customer_email && { buyer_email: customer_email }), // Add customer email if provided
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Invoice created successfully:", response.data);
    return NextResponse.json({
      invoiceUrl: response.data.invoice_url,
      invoiceId: response.data.id,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);

    // Provide more detailed error information
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorMessage =
        error.response?.data?.message || "Failed to create invoice";

      console.error("NOWPayments API error:", {
        status: statusCode,
        data: error.response?.data,
      });

      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
