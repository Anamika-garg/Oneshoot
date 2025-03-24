import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@/utils/supabase/server";
import { client } from "@/lib/sanity";

// Get API key from environment variable
const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const API_BASE_URL = "https://api.nowpayments.io/v1";

export async function POST(request) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Missing invoice ID" },
        { status: 400 }
      );
    }

    // Check payment status with NOWPayments API
    const response = await axios.get(`${API_BASE_URL}/payment/${invoiceId}`, {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    const paymentData = response.data;
    console.log("Payment data:", paymentData);

    // If payment is finished, update the order status
    if (
      paymentData.payment_status === "finished" ||
      paymentData.payment_status === "confirmed"
    ) {
      // Initialize Supabase client
      const supabase = createClient();

      // Find all orders with this invoice ID in metadata
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .filter("status", "eq", "pending_payment")
        .textSearch("metadata", invoiceId);

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!orders || orders.length === 0) {
        return NextResponse.json(
          { error: "No matching orders found" },
          { status: 404 }
        );
      }

      // Process each order - similar to your webhook handler
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
          created_at: new Date().toISOString(),
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

      return NextResponse.json({
        success: true,
        status: "updated",
        paymentStatus: paymentData.payment_status,
      });
    }

    // If payment is not finished yet
    return NextResponse.json({
      success: true,
      status: "pending",
      paymentStatus: paymentData.payment_status,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);

    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorMessage =
        error.response?.data?.message || "Failed to check payment status";

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

// Helper function to get available download links (reused from your webhook handler)
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
