"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCart } from "@/app/context/CartContext"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Check } from "lucide-react"
import { client } from "@/lib/sanity"

const supabase = createClient()

export default function MockPaymentCheckout({ amount, email, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paymentStep, setPaymentStep] = useState("initial") // initial, processing, success
  const router = useRouter()
  const { cart, clearCart, appliedPromo, recordPromoUsage } = useCart()

  // Simulate creating orders in the database
  const createOrders = async (mockInvoiceId) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) {
        toast.error("Please sign in to complete the purchase")
        return false
      }

      // Generate a unique order reference
      const orderGroupId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
      const orderIds = []

      // Create pending orders for each cart item
      for (const item of cart) {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            product_id: item.id,
            variant_id: item.variantId,
            status: "pending_payment", // Will be updated when payment is "confirmed"
            amount: item.price * item.quantity,
            promo_code: appliedPromo ? appliedPromo.code : null,
            discount_amount: appliedPromo ? calculateDiscountAmount(item.price, item.quantity) : 0,
            metadata: JSON.stringify({
              needed: item.quantity,
              orderGroupId: orderGroupId,
              mockInvoiceId: mockInvoiceId,
              email: email,
              productName: item.name,
              variantName: item.variantName,
              quantity: item.quantity,
              price: item.price,
              image: item.image,
            }),
          })
          .select()

        if (orderError) throw new Error(`Failed to create order: ${orderError.message}`)
        if (orderData && orderData.length > 0) {
          orderIds.push(orderData[0].id)
        }
      }

      // If a promo code was applied, record its usage
      if (appliedPromo) {
        await recordPromoUsage(orderGroupId)
      }

      return {
        success: true,
        orderGroupId,
        orderIds,
      }
    } catch (error) {
      console.error("Error creating order:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  const calculateDiscountAmount = (price, quantity) => {
    if (!appliedPromo) return 0

    const subtotal = price * quantity
    if (appliedPromo.isPercentage) {
      return subtotal * (appliedPromo.discount / 100)
    } else {
      return appliedPromo.discount
    }
  }

  // Simulate payment confirmation webhook
  const simulatePaymentConfirmation = async (mockInvoiceId, orderGroupId) => {
    try {
      // Get all pending payment orders
      const { data: allPendingOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "pending_payment")

      if (ordersError) throw new Error(`Error fetching orders: ${ordersError.message}`)

      if (!allPendingOrders || allPendingOrders.length === 0) {
        throw new Error("No pending orders found")
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

      if (orders.length === 0) {
        throw new Error(`No matching orders found for invoice: ${mockInvoiceId}`)
      }

      const processedOrders = []

      // Process each order - similar to what the webhook would do
      for (const order of orders) {
        const metadata = JSON.parse(order.metadata || "{}")

        // Get available download links for this product/variant
        const productDetailsResult = await getAvailableDownloadLinks(
          order.product_id,
          order.variant_id,
          metadata.needed || 1,
        )

        // Determine if we have enough links
        const hasEnoughLinks = productDetailsResult.hasEnoughLinks
        const itemStatus = hasEnoughLinks ? "paid" : "pending"

        // Update order status
        const { data: updatedOrder, error: updateError } = await supabase
          .from("orders")
          .update({
            status: itemStatus,
            download_links: productDetailsResult.productDetails,
            metadata: JSON.stringify({
              ...metadata,
              payment_confirmed: true,
              payment_time: new Date().toISOString(),
              available: productDetailsResult.availableCount,
            }),
          })
          .eq("id", order.id)
          .select()

        if (updateError) throw new Error(`Error updating order: ${updateError.message}`)

        if (updatedOrder && updatedOrder.length > 0) {
          processedOrders.push(updatedOrder[0])
        }

        // Create notification
        const notificationMessage = `Your payment has been confirmed. Your order is ready for download.`

        const { error: notificationError } = await supabase.from("notifications").insert({
          user_id: order.user_id,
          message: notificationMessage,
          product_id: order.product_id,
          variant_id: order.variant_id,
          order_id: order.id,
          read: false,
          email: email,
        })

        if (notificationError) throw new Error(`Error creating notification: ${notificationError.message}`)
      }

      // Send confirmation email
      try {
        const response = await fetch("/api/send-order-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            products: processedOrders.flatMap((order) => {
              return order.download_links || []
            }),
            orderId: orderGroupId,
            hasPendingProducts: processedOrders.some((order) => order.status === "pending"),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Email API error:", errorData)
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError)
      }

      return {
        success: true,
        orders: processedOrders,
      }
    } catch (error) {
      console.error("Error simulating payment confirmation:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Helper function to get available download links
  const getAvailableDownloadLinks = async (productId, variantId, quantity) => {
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
    } catch (error) {
      console.error("Error getting download links:", error)
      return {
        productDetails: [],
        hasEnoughLinks: false,
        availableCount: 0,
        neededCount: quantity,
      }
    }
  }

  const handleMockPayment = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setPaymentStep("processing")

      // Create a mock invoice ID
      const mockInvoiceId = `mock_invoice_${Date.now()}`

      // Step 1: Create orders in pending state
      const orderResult = await createOrders(mockInvoiceId)

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order records")
      }

      // Step 2: Simulate payment processing (with a delay to mimic real payment)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Step 3: Simulate payment confirmation webhook
      const confirmationResult = await simulatePaymentConfirmation(mockInvoiceId, orderResult.orderGroupId)

      if (!confirmationResult.success) {
        throw new Error(confirmationResult.error || "Failed to process payment confirmation")
      }

      // Step 4: Success
      setPaymentStep("success")
      clearCart()

      // Step 5: Show success popup and redirect after a delay
      setTimeout(() => {
        onClose()
        if (onSuccess) {
          onSuccess(confirmationResult.orders)
        }
      }, 3000)
    } catch (error) {
      console.error("Payment error:", error)
      setError(error.message)
      setPaymentStep("initial")
      toast.error(`Payment error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-lightBlack rounded-2xl p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-yellow-500"
          aria-label="Close payment window"
          disabled={paymentStep === "processing"}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          {paymentStep === "success" ? "Payment Successful" : "Mock Crypto Payment"}
        </h2>

        {paymentStep === "initial" && (
          <div className="space-y-4">
            <div className="p-4 bg-black/30 rounded-lg">
              <p className="text-gray-400 mb-1">Total Amount</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent">
                ${amount}
              </p>
            </div>

            <div className="p-4 bg-black/30 rounded-lg">
              <p className="text-gray-400 mb-1">Delivery Email</p>
              <p className="text-white break-all">{email}</p>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-500 text-sm">
                This is a mock payment for testing. In production, you would be redirected to NOWPayments.
              </p>
            </div>

            {error && <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">{error}</div>}

            <Button
              onClick={handleMockPayment}
              disabled={isLoading}
              className="w-full rounded-lg bg-yellow px-6 py-3 text-black transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simulate Payment
            </Button>
          </div>
        )}

        {paymentStep === "processing" && (
          <div className="space-y-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
            <p className="text-white">Processing your payment...</p>
            <p className="text-sm text-gray-400">This simulates the payment processing and webhook confirmation</p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-white" />
            </div>
            <p className="text-white">Your payment was successful!</p>
            <p className="text-sm text-gray-400">Redirecting to your account page...</p>
          </div>
        )}
      </div>
    </div>
  )
}

