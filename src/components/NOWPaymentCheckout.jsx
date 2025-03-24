"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function NOWPaymentsCheckout({ amount, email, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { cart, clearCart, appliedPromo, recordPromoUsage } = useCart();

  const createOrder = async (invoiceId) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        toast.error("Please sign in to complete the purchase");
        return false;
      }

      // Generate a unique order reference
      const orderGroupId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      // Create pending orders for each cart item
      for (const item of cart) {
        const { error: orderError } = await supabase.from("orders").insert({
          user_id: user.id,
          product_id: item.id,
          variant_id: item.variantId,
          status: "pending_payment", // Will be updated by webhook when payment is confirmed
          amount: item.price * item.quantity,
          promo_code: appliedPromo ? appliedPromo.code : null,
          discount_amount: appliedPromo
            ? calculateDiscountAmount(item.price, item.quantity)
            : 0,
          metadata: JSON.stringify({
            needed: item.quantity,
            orderGroupId: orderGroupId,
            nowpayments_invoice_id: invoiceId,
            email: email,
          }),
        });

        if (orderError)
          throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // If a promo code was applied, record its usage
      if (appliedPromo) {
        await recordPromoUsage(orderGroupId);
      }

      return true;
    } catch (error) {
      console.error("Error creating order:", error);
      return false;
    }
  };

  const calculateDiscountAmount = (price, quantity) => {
    if (!appliedPromo) return 0;

    const subtotal = price * quantity;
    if (appliedPromo.isPercentage) {
      return subtotal * (appliedPromo.discount / 100);
    } else {
      return appliedPromo.discount;
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a unique order ID
      const orderId = `order_${Date.now()}`;

      // Create invoice via API route
      const response = await fetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_amount: Number.parseFloat(amount),
          order_id: orderId,
          order_description: `Purchase of ${cart.length} item(s)`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment invoice");
      }

      const { invoiceUrl, invoiceId } = await response.json();

      // Create order records in pending state
      const orderCreated = await createOrder(invoiceId);

      if (!orderCreated) {
        throw new Error("Failed to create order records");
      }

      // Clear cart and redirect to NOWPayments invoice page
      clearCart();

      // Store the invoice ID in localStorage for potential recovery
      localStorage.setItem("lastPaymentId", invoiceId);

      // Set a cookie to validate this payment ID
      document.cookie = `np_payment_id=${invoiceId}; path=/; max-age=3600;`; // 1 hour expiry

      window.location.href = invoiceUrl;
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message);
      toast.error(`Payment error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
      <div className='bg-lightBlack rounded-2xl p-6 max-w-md w-full relative'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-white hover:text-yellow-500'
          aria-label='Close payment window'
        >
          ✕
        </button>

        <h2 className='text-2xl font-bold text-white mb-6'>Crypto Payment</h2>

        <div className='space-y-4'>
          <div className='p-4 bg-black/30 rounded-lg'>
            <p className='text-gray-400 mb-1'>Total Amount</p>
            <p className='text-2xl font-bold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
              ${amount}
            </p>
          </div>

          <div className='p-4 bg-black/30 rounded-lg'>
            <p className='text-gray-400 mb-1'>Delivery Email</p>
            <p className='text-white break-all'>{email}</p>
          </div>

          {error && (
            <div className='p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400'>
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isLoading}
            className='w-full rounded-lg bg-yellow px-6 py-3 text-black transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? "Processing..." : "Pay with Crypto"}
          </button>

          <p className='text-sm text-gray-400 text-center'>
            You'll be redirected to NOWPayments to complete your transaction
          </p>
        </div>
      </div>
    </div>
  );
}
