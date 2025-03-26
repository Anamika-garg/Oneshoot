import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { client } from "@/lib/sanity";

// Get environment variables
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

export async function POST(request) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");

    console.log("Received NOWPayments webhook", {
      signature: signature ? "present" : "missing",
      bodyLength: rawBody.length,
    });

    // Verify signature if in production
    if (process.env.NODE_ENV === "production" && IPN_SECRET) {
      if (!signature) {
        console.error("Missing signature header");
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 401 }
        );
      }

      // Create a hash using the IPN secret
      const hash = crypto
        .createHmac("sha512", IPN_SECRET)
        .update(rawBody)
        .digest("hex");

      // Compare the calculated hash with the provided signature
      if (hash !== signature) {
        console.error("Invalid signature");
        console.error("Calculated hash:", hash);
        console.error("Provided signature:", signature);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }

      console.log("Signature verified successfully");
    } else {
      console.log(
        "Skipping signature verification (not in production or missing IPN_SECRET)"
      );
    }

    // Parse the event data
    const event = JSON.parse(rawBody);
    console.log("NOWPayments webhook received:", event);

    // Initialize Supabase client properly using your createClient function
    const supabase = await createClient();

    // Process all payment statuses, not just "finished"
    const {
      payment_id,
      invoice_id,
      payment_status,
      order_id,
      pay_address,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
      actually_paid,
      actually_paid_at_fiat,
    } = event;

    console.log(
      `Processing payment ${payment_id} with status ${payment_status}`
    );

    // First, try to find orders by order_id directly
    // This is more reliable than searching in JSON
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*");

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return NextResponse.json(
        { error: "Database error", details: ordersError },
        { status: 500 }
      );
    }

    // Filter orders to find those with matching order_id, invoice_id or payment_id in metadata
    const matchingOrders = orders.filter((order) => {
      try {
        const metadata = JSON.parse(order.metadata || "{}");

        // Check if the order_id from NOWPayments matches the one in metadata
        if (order_id && metadata.order_id === order_id) {
          return true;
        }

        // Check for invoice_id match
        if (invoice_id && metadata.nowpayments_invoice_id == invoice_id) {
          return true;
        }

        // Check for payment_id match
        if (payment_id && metadata.payment_id == payment_id) {
          return true;
        }

        return false;
      } catch (e) {
        console.error("Error parsing metadata for order:", order.id, e);
        return false;
      }
    });

    if (!matchingOrders || matchingOrders.length === 0) {
      console.error(
        "No matching orders found for payment. Order ID:",
        order_id,
        "Invoice ID:",
        invoice_id,
        "Payment ID:",
        payment_id
      );

      // If no orders found, try to find by order_id in a different format
      // Sometimes the order_id format might be different between systems
      if (order_id) {
        const secondaryMatches = orders.filter((order) => {
          try {
            const metadata = JSON.parse(order.metadata || "{}");
            // Check various possible formats of order_id
            return (
              metadata.orderGroupId === order_id ||
              metadata.orderGroupId === order_id.replace("order_", "") ||
              (metadata.order_id &&
                (metadata.order_id === order_id ||
                  metadata.order_id.includes(order_id) ||
                  order_id.includes(metadata.order_id)))
            );
          } catch (e) {
            return false;
          }
        });

        if (secondaryMatches.length > 0) {
          console.log(
            `Found ${secondaryMatches.length} orders with secondary matching`
          );
          matchingOrders.push(...secondaryMatches);
        }
      }

      // If still no matches, return error
      if (matchingOrders.length === 0) {
        return NextResponse.json(
          {
            error: "No matching orders",
            order_id,
            invoice_id,
            payment_id,
          },
          { status: 404 }
        );
      }
    }

    console.log(`Found ${matchingOrders.length} orders to update`);

    // Map NOWPayments status to your system status
    const statusMap = {
      waiting: "pending_payment",
      confirming: "processing",
      confirmed: "processing",
      sending: "processing",
      partially_paid: "partially_paid",
      finished: "paid",
      failed: "failed",
      refunded: "refunded",
      expired: "expired",
    };

    const newStatus = statusMap[payment_status] || "pending_payment";

    // Process each order
    for (const order of matchingOrders) {
      const metadata = JSON.parse(order.metadata || "{}");
      const orderGroupId = metadata.orderGroupId;
      const email = metadata.email;

      console.log(`Updating order ${order.id} to status ${newStatus}`);

      // Only get download links if payment is finished
      let productDetailsArray = { productDetails: [], availableCount: 0 };

      if (payment_status === "finished") {
        try {
          // Get available download links for this product/variant
          productDetailsArray = await getAvailableDownloadLinks(
            order.product_id,
            order.variant_id,
            metadata.needed || 1
          );
        } catch (error) {
          console.error("Error getting download links:", error);
          // Continue with empty product details
        }
      }

      // Determine if we have enough links (only relevant for finished payments)
      const hasEnoughLinks =
        payment_status === "finished"
          ? productDetailsArray.availableCount >= (metadata.needed || 1)
          : false;

      // If payment is finished but we don't have enough links, keep status as pending
      const itemStatus =
        payment_status === "finished" && !hasEnoughLinks
          ? "pending"
          : newStatus;

      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: itemStatus,
          ...(payment_status === "finished"
            ? { download_links: productDetailsArray.productDetails }
            : {}),
          metadata: JSON.stringify({
            ...metadata,
            payment_status,
            payment_id,
            invoice_id,
            order_id,
            payment_updated_at: new Date().toISOString(),
            ...(payment_status === "finished"
              ? {
                  payment_confirmed: true,
                  payment_time: new Date().toISOString(),
                  available: productDetailsArray.availableCount,
                }
              : {}),
          }),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Error updating order:", updateError);
        continue; // Try to process other orders even if this one fails
      }

      // Create notification for status changes
      let notificationMessage = "";

      switch (payment_status) {
        case "finished":
          notificationMessage = hasEnoughLinks
            ? `Your payment has been confirmed. Your order is ready for download.`
            : `Your payment has been confirmed. Your order will be available for download soon.`;
          break;
        case "confirming":
        case "confirmed":
        case "sending":
          notificationMessage = `Your payment is being processed. We'll notify you when it's complete.`;
          break;
        case "partially_paid":
          notificationMessage = `We received a partial payment. Please complete your payment to receive your order.`;
          break;
        case "failed":
          notificationMessage = `There was an issue with your payment. Please contact support.`;
          break;
        case "refunded":
          notificationMessage = `Your payment has been refunded.`;
          break;
        case "expired":
          notificationMessage = `Your payment has expired. Please try again.`;
          break;
        default:
          notificationMessage = `Your payment status has been updated to: ${payment_status}`;
      }

      if (notificationMessage) {
        try {
          await supabase.from("notifications").insert({
            user_id: order.user_id,
            message: notificationMessage,
            product_id: order.product_id,
            variant_id: order.variant_id,
            order_id: order.id,
            read: false,
            email: email,
          });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
    }

    // Only send confirmation email if payment is finished
    if (payment_status === "finished") {
      // Get all product details from orders
      const allProductDetails = matchingOrders.flatMap((order) => {
        const downloadLinks = order.download_links || [];
        return downloadLinks;
      });

      const hasPendingProducts = matchingOrders.some(
        (order) => order.status === "pending"
      );

      // Get the first order's metadata to extract email and orderGroupId
      const firstOrderMetadata = JSON.parse(matchingOrders[0].metadata || "{}");
      const email = firstOrderMetadata.email;
      const orderGroupId = firstOrderMetadata.orderGroupId;

      if (email) {
        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
          await fetch(`${baseUrl}/api/send-order-email`, {
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
          });
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          // Continue processing even if email fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${matchingOrders.length} orders with status ${payment_status}`,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error.message,
        stack: error.stack,
      },
      { status: 400 }
    );
  }
}

// Helper function to get available download links
async function getAvailableDownloadLinks(productId, variantId, quantity) {
  try {
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
      console.error("Product or variant not found", { productId, variantId });
      return {
        productDetails: [],
        hasEnoughLinks: false,
        availableCount: 0,
        neededCount: quantity,
      };
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
        const baseUrl = "https://oneshot.sale";
        const response = await fetch(`${baseUrl}/api/update-download-link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variantId,
            downloadLinks: updatedLinks,
          }),
        });

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
  } catch (error) {
    console.error("Error getting download links:", error);
    return {
      productDetails: [],
      hasEnoughLinks: false,
      availableCount: 0,
      neededCount: quantity,
    };
  }
}
