import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { client } from "@/lib/sanity";

// Get environment variables
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");

    // Verify signature if in production
    if (process.env.NODE_ENV === "production") {
      if (!signature) {
        console.error("Missing signature header");
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 401 }
        );
      }

      const hash = crypto
        .createHmac("sha512", IPN_SECRET)
        .update(rawBody)
        .digest("hex");

      if (hash !== signature) {
        console.error("Invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    console.log("NOWPayments webhook received:", event);

    // Only process finished payments
    if (event.payment_status === "finished") {
      const {
        order_id,
        invoice_id,
        pay_address,
        price_amount,
        price_currency,
      } = event;

      // Initialize Supabase client
      const supabase = createClient();

      // Find all orders with this invoice ID in metadata
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .filter("status", "eq", "pending_payment")
        .textSearch("metadata", invoice_id);

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!orders || orders.length === 0) {
        console.error("No matching orders found for invoice:", invoice_id);
        return NextResponse.json(
          { error: "No matching orders" },
          { status: 404 }
        );
      }

      // Process each order
      for (const order of orders) {
        const metadata = JSON.parse(order.metadata || "{}");
        const orderGroupId = metadata.orderGroupId;
        const email = metadata.email;

        // Get available download links for this product/variant
        const productDetailsArray = await getAvailableDownloadLinks(
          order.product_id,
          order.variant_id,
          metadata.needed || 1
        );

        // Determine if we have enough links
        const hasEnoughLinks =
          productDetailsArray.availableCount >= (metadata.needed || 1);
        const itemStatus = hasEnoughLinks ? "paid" : "pending";

        // Update order status
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: itemStatus,
            download_links: productDetailsArray.productDetails,
            metadata: JSON.stringify({
              ...metadata,
              payment_confirmed: true,
              payment_time: new Date().toISOString(),
              available: productDetailsArray.availableCount,
            }),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("Error updating order:", updateError);
          continue; // Try to process other orders even if this one fails
        }

        // Create notification
        let notificationMessage = "";
        if (itemStatus === "pending") {
          notificationMessage = `Your payment has been confirmed. Your order will be available for download soon.`;
        } else {
          notificationMessage = `Your payment has been confirmed. Your order is ready for download.`;
        }

        await supabase.from("notifications").insert({
          user_id: order.user_id,
          message: notificationMessage,
          product_id: order.product_id,
          variant_id: order.variant_id,
          order_id: order.id,
          read: false,
          email: email,
        });
      }

      // Send confirmation email with all products
      const allProductDetails = orders.flatMap((order) => {
        const downloadLinks = order.download_links || [];
        return downloadLinks;
      });

      const hasPendingProducts = orders.some(
        (order) => order.status === "pending"
      );

      // Get the first order's metadata to extract email and orderGroupId
      const firstOrderMetadata = JSON.parse(orders[0].metadata || "{}");
      const email = firstOrderMetadata.email;
      const orderGroupId = firstOrderMetadata.orderGroupId;

      if (email) {
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/send-order-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email,
                products: allProductDetails,
                orderId: orderGroupId,
                hasPendingProducts,
                paymentMethod: "crypto",
              }),
            }
          );
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          // Continue processing even if email fails
        }
      }
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

// Helper function to get available download links
async function getAvailableDownloadLinks(productId, variantId, quantity) {
  // Query to get the product and variant details with download links
  const query = `
    *[_type == "product" && _id == $productId][0]{
      name,
      "variant": *[_type == "productVariant" && _id == $variantId][0]{
        name,
        downloadLinks
      }
    }
  `;

  // Get the current state of the product and variant
  const productData = await client.fetch(query, {
    productId,
    variantId,
  });

  // Check if product and variant exist
  if (!productData || !productData.variant) {
    throw new Error("Product or variant not found");
  }

  const downloadLinks = productData.variant.downloadLinks || [];

  // Find all unused links
  const unusedLinks = downloadLinks.filter((link) => !link.isUsed);

  // Check if we have enough links
  const hasEnoughLinks = unusedLinks.length >= quantity;

  // Get the links that will be used
  const linksToUse = unusedLinks.slice(
    0,
    Math.min(quantity, unusedLinks.length)
  );

  // If we have some links to use, mark them as used
  if (linksToUse.length > 0) {
    // Mark the links as used
    const updatedLinks = [...downloadLinks];

    // Update each link that will be used
    linksToUse.forEach((linkToUse) => {
      const linkIndex = updatedLinks.findIndex(
        (link) => link.filePath === linkToUse.filePath && !link.isUsed
      );

      if (linkIndex !== -1) {
        updatedLinks[linkIndex] = {
          ...updatedLinks[linkIndex],
          isUsed: true,
        };
      }
    });

    // Update the variant in Sanity
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/update-download-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variantId,
            downloadLinks: updatedLinks,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update download links");
      }

      // Wait for the response to ensure the update is complete
      await response.json();
    } catch (error) {
      console.error("Error updating download links:", error);
      throw error;
    }
  }

  // Return product details with download links and availability status
  return {
    productDetails: linksToUse.map((link) => ({
      productName: productData.name || "Unknown Product",
      variantName: productData.variant.name || "Unknown Variant",
      downloadFilePath: link.filePath || "",
    })),
    hasEnoughLinks,
    availableCount: linksToUse.length,
    neededCount: quantity,
  };
}
