import { NextResponse } from "next/server";
import { Resend } from "resend";
import ContactFormEmail from "@/templates/ContactFormEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, message } = await request.json();

    const data = await resend.emails.send({
      from: "OneShot Store <dontreply@oneshot.sale>",
      to: process.env.NEXT_PUBLIC_OWNER_EMAIL,
      subject: "New Contact Form Submission",
      react: ContactFormEmail({ name, message }),
    });

    return NextResponse.json({ message: "Email sent successfully", data });
  } catch (error) {
    return NextResponse.json(
      { message: "Email sending failed", error: error.message },
      { status: 400 }
    );
  }
}
