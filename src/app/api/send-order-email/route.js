import OrderConfirmationEmail from "@/templates/OrderConfirmationEmail";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, productName, variantName, downloadFilePath } =
      await request.json();

    const data = await resend.emails.send({
      from: "OneShot Store <dontreply@oneshot.sale",
      to: [email],
      subject: "Your Order Confirmation",
      react: OrderConfirmationEmail({
        productName,
        variantName,
        downloadFilePath,
      }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
