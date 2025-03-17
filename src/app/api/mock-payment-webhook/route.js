import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { client } from "@/lib/sanity"

export async function POST(request) {
  try {
    const { mockInvoiceId, orderGroupId, email } = await request.json()

    // Initialize Supabase client
    const supabase = createClient()

    // Get all pending payment orders
    const { data: allPendingOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending_payment")

    if (ordersError) {
      console.error("Error fetching orders:", ordersError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Filter orders with the matching mockInvoiceId in metadata
    const orders = allPendingOrders.filter((order) => {
      try {
        const metadata = JSON.parse(order.metadata || "{}")
        return metadata.mockInvoiceId === mockInvoiceId
      } catch (e) {
        return false
      }
    })

    if (!orders || orders.length === 0) {
      console.error("No matching orders found for invoice:", mockInvoiceId)
      return NextResponse.json({ error: "No matching orders" }, { status: 404 })
    }

    // Process each order
    for (const order of orders) {
      const metadata = JSON.parse(order.metadata || "{}")

      // Get available download links for this product/variant
      const productDetailsArray = await getAvailableDownloadLinks(
        order.product_id,
        order.variant_id,
        metadata.needed || 1,
      )

      // Determine if we have enough links
      const hasEnoughLinks = productDetailsArray.availableCount >= (metadata.needed || 1)
      const itemStatus = hasEnoughLinks ? "paid" : "pending"

      // Update order status and include all necessary fields for OrdersTab
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
            productName: metadata.productName || "Product",
            variantName: metadata.variantName || "Variant",
            quantity: metadata.quantity || 1,
            price: metadata.price || 0,
            image: metadata.image || "",
          }),
        })
        .eq("id", order.id)

      if (updateError) {
        console.error("Error updating order:", updateError)
        continue // Try to process other orders even if this one fails
      }

      // Create notification
      let notificationMessage = ""
      if (itemStatus === "pending") {
        notificationMessage = `Your payment has been confirmed. Your order will be available for download soon.`
      } else {
        notificationMessage = `Your payment has been confirmed. Your order is ready for download.`
      }

      await supabase.from("notifications").insert({
        user_id: order.user_id,
        message: notificationMessage,
        product_id: order.product_id,
        variant_id: order.variant_id,
        order_id: order.id,
        read: false,
        email: email || metadata.email,
      })
    }

    // Send confirmation email with all products
    const allProductDetails = orders.flatMap((order) => {
      const downloadLinks = order.download_links || []
      return downloadLinks
    })

    const hasPendingProducts = orders.some((order) => order.status === "pending")

    if (email) {
      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            products: allProductDetails,
            orderId: orderGroupId,
            hasPendingProducts,
          }),
        })
      } catch (emailError) {
        console.error("Error sending email:", emailError)
        // Continue processing even if email fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mock webhook error:", error)
    return NextResponse.json({ error: "Mock webhook processing failed" }, { status: 400 })
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
  `

  // Get the current state of the product and variant
  const productData = await client.fetch(query, {
    productId,
    variantId,
  })

  // Check if product and variant exist
  if (!productData || !productData.variant) {
    throw new Error("Product or variant not found")
  }

  const downloadLinks = productData.variant.downloadLinks || []

  // Find all unused links
  const unusedLinks = downloadLinks.filter((link) => !link.isUsed)

  // Check if we have enough links
  const hasEnoughLinks = unusedLinks.length >= quantity

  // Get the links that will be used
  const linksToUse = unusedLinks.slice(0, Math.min(quantity, unusedLinks.length))

  // If we have some links to use, mark them as used
  if (linksToUse.length > 0) {
    // Mark the links as used
    const updatedLinks = [...downloadLinks]

    // Update each link that will be used
    linksToUse.forEach((linkToUse) => {
      const linkIndex = updatedLinks.findIndex((link) => link.filePath === linkToUse.filePath && !link.isUsed)

      if (linkIndex !== -1) {
        updatedLinks[linkIndex] = {
          ...updatedLinks[linkIndex],
          isUsed: true,
        }
      }
    })

    // Update the variant in Sanity
    try {
      const response = await fetch("/api/update-download-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId,
          downloadLinks: updatedLinks,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update download links")
      }

      // Wait for the response to ensure the update is complete
      await response.json()
    } catch (error) {
      console.error("Error updating download links:", error)
      throw error
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
  }
}

