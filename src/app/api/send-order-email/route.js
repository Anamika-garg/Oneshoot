import OrderConfirmationEmail from "@/templates/OrderConfirmationEmail";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // Log the start of the request
    console.log("Starting email send process");

    // Parse the request body
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body));

    const { email, products, orderId, hasPendingProducts } = body;

    // Validate inputs
    if (!email) {
      console.error("Missing email address");
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    if (!orderId) {
      console.error("Missing order ID");
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Ensure products is always an array
    const productsList = Array.isArray(products) ? products : [];
    console.log(`Processing ${productsList.length} products`);

    // Group products by variant for better presentation
    const groupedProducts = productsList.reduce((acc, product) => {
      const key = `${product.productName}-${product.variantName}`;
      if (!acc[key]) {
        acc[key] = {
          productName: product.productName,
          variantName: product.variantName,
          downloadLinks: [product.downloadFilePath],
        };
      } else {
        acc[key].downloadLinks.push(product.downloadFilePath);
      }
      return acc;
    }, {});

    // Convert back to array for the email template
    const emailProducts = Object.values(groupedProducts).map((group) => ({
      productName: group.productName,
      variantName: group.variantName,
      downloadLinks: group.downloadLinks,
    }));

    // Set expiry time (7 days from now)
    const expiryTime = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }

    console.log("Sending email to:", email);
    console.log("Email products:", JSON.stringify(emailProducts));

    // Send the email
    const data = await resend.emails.send({
      from: "OneShot Store <dontreply@oneshot.sale>",
      to: [email],
      subject: "Your Order Confirmation",
      react: OrderConfirmationEmail({
        products: emailProducts,
        orderId,
        expiryTime,
        hasPendingProducts: !!hasPendingProducts,
      }),
    });

    console.log("Email sent successfully:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    console.error("Error details:", error.stack);

    // Return a more detailed error response
    return NextResponse.json(
      {
        error: error.message || "Failed to send order confirmation email",
        details: error.details || error.stack,
        name: error.name,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
