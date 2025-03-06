import { writeClient } from "@/lib/sanity";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import OrderReadyEmail from "@/templates/OrderReadyEmail";

// Initialize Supabase client (using service role key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase environment variables not set");
}

// Initialize Resend for email notifications
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    console.log("Starting assign-pending-links process");

    // Expect a JSON body with the variantId
    const { variantId } = await request.json();
    if (!variantId) {
      console.error("Missing variant ID in request");
      return NextResponse.json(
        { success: false, error: "Missing variant ID" },
        { status: 400 }
      );
    }
    console.log(`Processing orders for variant: ${variantId}`);

    if (!supabase) {
      console.error("Supabase client not initialized");
      return NextResponse.json(
        { success: false, error: "Supabase client not initialized" },
        { status: 500 }
      );
    }

    // 1. Fetch the variant from Sanity (including downloadLinks and product info)
    const query = `*[_type == "productVariant" && _id == $variantId][0]{
      _id,
      name,
      downloadLinks,
      "product": *[_type == "product" && references(^._id)][0]{ _id, name }
    }`;
    const variantData = await writeClient.fetch(query, { variantId });
    if (!variantData) {
      console.log(`Variant not found: ${variantId}`);
      return NextResponse.json(
        { success: false, error: "Variant not found" },
        { status: 404 }
      );
    }
    if (!variantData.downloadLinks || variantData.downloadLinks.length === 0) {
      console.log(`No download links found for variant: ${variantId}`);
      return NextResponse.json(
        { success: false, error: "Variant has no download links" },
        { status: 400 }
      );
    }
    console.log(
      `Found ${variantData.downloadLinks.length} download links for variant: ${variantId}`
    );

    // 2. Find unused download links
    const unusedLinks = variantData.downloadLinks.filter(link => !link.isUsed);
    if (unusedLinks.length === 0) {
      console.log(`No unused download links available for variant: ${variantId}`);
      return NextResponse.json(
        { success: false, error: "No unused download links available" },
        { status: 400 }
      );
    }
    console.log(
      `Found ${unusedLinks.length} unused download links for variant: ${variantId}`
    );

    // 3. Fetch orders for this variant that are pending OR paid but without assigned download links.
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("variant_id", variantId)
      .in("status", ["pending", "paid"])
      .order("created_at", { ascending: true });
    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return NextResponse.json(
        { success: false, error: `Error fetching orders: ${ordersError.message}` },
        { status: 500 }
      );
    }
    if (!ordersData || ordersData.length === 0) {
      console.log(`No orders found for variant: ${variantId}`);
      return NextResponse.json({
        success: true,
        message: "No orders for this variant",
      });
    }
    // Filter orders that do not have assigned download links.
    const ordersToProcess = ordersData.filter(order => {
      return !order.download_links || (Array.isArray(order.download_links) && order.download_links.length === 0);
    });
    if (ordersToProcess.length === 0) {
      console.log("No orders pending download assignment for this variant");
      return NextResponse.json({
        success: true,
        message: "No orders pending download assignment",
      });
    }
    console.log(`Found ${ordersToProcess.length} order(s) needing download links`);

    const results = [];
    const updatedLinks = [...variantData.downloadLinks]; // copy of the downloadLinks array
    const emailsToSend = [];

    // 4. Process each order that needs download links.
    for (const order of ordersToProcess) {
      // Determine how many links the order requires.
      let quantity = 1;
      let orderGroupId = null;
      try {
        if (order.metadata) {
          const metadata =
            typeof order.metadata === "string"
              ? JSON.parse(order.metadata)
              : order.metadata;
          if (metadata.needed) {
            quantity = metadata.needed;
          }
          if (metadata.orderGroupId) {
            orderGroupId = metadata.orderGroupId;
          }
        } else {
          // Fallback: calculate quantity based on order amount and product price from Sanity.
          const priceQuery = `*[_type == "product" && _id == $productId][0]{
            "variant": *[_type == "productVariant" && _id == $variantId][0]{
              price
            }
          }`;
          const priceData = await writeClient.fetch(priceQuery, {
            productId: order.product_id,
            variantId: order.variant_id,
          });
          const price = priceData?.variant?.price;
          if (price && order.amount) {
            quantity = Math.round(order.amount / price);
          }
        }
      } catch (error) {
        console.error("Error calculating quantity:", error);
      }
      console.log(`Order ${order.id} needs ${quantity} link(s)`);

      // Check if there are enough unused links left.
      const remainingUnusedLinks = updatedLinks.filter(link => !link.isUsed);
      if (remainingUnusedLinks.length < quantity) {
        console.log(`Not enough links for order ${order.id}, skipping`);
        results.push({
          orderId: order.id,
          status: "skipped",
          reason: "Not enough unused links available",
        });
        continue;
      }

      // Mark the necessary links as used and collect them.
      const linksToUse = remainingUnusedLinks.slice(0, quantity);
      const downloadLinksForOrder = [];
      for (const linkToUse of linksToUse) {
        const linkIndex = updatedLinks.findIndex(
          (link) => link.filePath === linkToUse.filePath && !link.isUsed
        );
        if (linkIndex !== -1) {
          updatedLinks[linkIndex] = { ...updatedLinks[linkIndex], isUsed: true };
          downloadLinksForOrder.push({ filePath: linkToUse.filePath });
        }
      }

      // Update the order record with the download links and set status to "paid".
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          download_links: downloadLinksForOrder,
          status: "paid",
        })
        .eq("id", order.id);
      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
        results.push({
          orderId: order.id,
          status: "error",
          error: updateError.message,
        });
        continue;
      }

      // Ensure we have the user's email. If not, fetch it via the admin API.
      if (!order.email) {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(order.user_id);
        if (userError) {
          console.error(`Error fetching email for user ${order.user_id}:`, userError);
        } else if (userData?.user?.email) {
          order.email = userData.user.email;
        }
      }

      // Create a notification record.
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: order.user_id,
          message: `Your order for ${variantData.product?.name || "Product"} (${variantData.name}) is now ready for download!`,
          product_id: variantData.product?._id,
          variant_id: variantId,
          order_id: order.id,
          read: false,
          email: order.email || null,
        });
      if (notificationError) {
        console.error(`Error creating notification for order ${order.id}:`, notificationError);
      }

      // Queue email notification if we have an email.
      if (order.email) {
        emailsToSend.push({
          email: order.email,
          products: downloadLinksForOrder.map(dl => ({
            productName: variantData.product?.name || "Product",
            variantName: variantData.name || "Variant",
            downloadFilePath: dl.filePath,
          })),
          orderId: order.id,
          orderGroupId: orderGroupId,
        });
      }
      results.push({
        orderId: order.id,
        status: "fulfilled",
        linksAssigned: linksToUse.length,
      });
    }

    // 5. Update the variant in Sanity with the new download link statuses.
    try {
      await writeClient
        .patch(variantId)
        .set({ downloadLinks: updatedLinks })
        .commit();
      console.log(`Updated download links for variant ${variantId}`);
    } catch (error) {
      console.error(`Error updating download links for variant ${variantId}:`, error);
    }

    // 6. Send email notifications.
    const emailResults = [];
    for (const emailData of emailsToSend) {
      try {
        await sendOrderReadyEmail(emailData);
        emailResults.push({
          email: emailData.email,
          status: "sent",
          orderId: emailData.orderId,
        });
      } catch (emailError) {
        console.error(`Error sending email for order ${emailData.orderId}:`, emailError);
        emailResults.push({
          email: emailData.email,
          status: "error",
          orderId: emailData.orderId,
          error: emailError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} orders for variant ${variantId}`,
      results,
      emailsSent: emailResults,
    });
  } catch (error) {
    console.error("Error assigning download links:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to assign download links",
      },
      { status: 500 }
    );
  }
}

async function sendOrderReadyEmail({ email, products, orderId, orderGroupId }) {
  if (!email || !products || products.length === 0) {
    console.log("Missing required data for email, skipping");
    return;
  }
  try {
    console.log(`Sending order ready email to ${email}`);
    // Group products by variant for better presentation.
    const groupedProducts = products.reduce((acc, product) => {
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
    const emailProducts = Object.values(groupedProducts);
    const data = await resend.emails.send({
      from: "OneShot Store <dontreply@oneshot.sale>",
      to: [email],
      subject: "Your Order is Ready for Download",
      react: OrderReadyEmail({
        products: emailProducts,
        orderId: orderGroupId || orderId,
      }),
    });
    console.log(`Email sent successfully to ${email}`, data);
    return data;
  } catch (error) {
    console.error("Error sending order ready email:", error);
    throw error;
  }
}