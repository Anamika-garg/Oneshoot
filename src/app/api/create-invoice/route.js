import { NextResponse } from "next/server";
import axios from "axios";

const API_KEY = "5JTJZP2-F4Q4RFV-Q02CKEZ-FPV8YAV";
const API_URL = "https://api.nowpayments.io/v1/invoice";

export async function POST(request) {
  try {
    const { price_amount, order_id, order_description } = await request.json();

    const response = await axios.post(
      API_URL,
      {
        price_amount,
        price_currency: "usd",
        order_id,
        order_description,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/nowpayments-webhook`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        partially_paid_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-partial`,
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
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", error.response?.data);
    }
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
