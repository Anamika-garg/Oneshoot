import { NextResponse } from "next/server";
import crypto from "crypto";

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");

    const hash = crypto
      .createHmac("sha512", IPN_SECRET)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      throw new Error("Invalid signature");
    }

    const event = JSON.parse(rawBody);

    if (event.payment_status === "finished") {
      // Payment confirmed, update your database and fulfill the order
      const { order_id, pay_address, price_amount, price_currency } = event;
      // TODO: Update order status in your database
      console.log(`Payment confirmed for order: ${order_id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
