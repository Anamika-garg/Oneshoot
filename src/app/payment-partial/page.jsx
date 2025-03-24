"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function PaymentPartialPage() {
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [validPayment, setValidPayment] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("NP_id");

  // Function to validate the payment
  const validatePayment = async () => {
    try {
      if (!paymentId) {
        router.push("/");
        return false;
      }

      // Check if this payment ID exists in our database
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .textSearch("metadata", paymentId);

      if (ordersError) {
        console.error("Database error:", ordersError);
        router.push("/");
        return false;
      }

      if (!orders || orders.length === 0) {
        // Check if we have a direct access cookie
        const directAccess = document.cookie
          .split("; ")
          .find((row) => row.startsWith("payment_direct_access="));

        if (directAccess) {
          // This might be a direct access attempt, but let's check with NOWPayments API
          // to see if this is a valid payment ID before redirecting
          try {
            const response = await fetch("/api/validate-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId }),
            });

            if (!response.ok) {
              router.push("/");
              return false;
            }

            const data = await response.json();
            if (!data.valid) {
              router.push("/");
              return false;
            }

            // If we get here, it's a valid payment ID but we don't have an order yet
            // Let's allow the user to stay on this page as the webhook might not have processed yet
            return true;
          } catch (err) {
            router.push("/");
            return false;
          }
        }
      }

      return true;
    } catch (err) {
      console.error("Error validating payment:", err);
      router.push("/");
      return false;
    }
  };

  useEffect(() => {
    async function init() {
      const isValid = await validatePayment();
      setValidPayment(isValid);

      if (isValid) {
        await checkPayment();
      }
    }

    init();
  }, [paymentId]);

  async function checkPayment() {
    try {
      if (!paymentId) {
        setLoading(false);
        return;
      }

      // Check if we have any orders with this payment ID
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .textSearch("metadata", paymentId);

      if (ordersError) throw ordersError;

      if (orders && orders.length > 0) {
        // Get the first order to extract common details
        const firstOrder = orders[0];
        const metadata = JSON.parse(firstOrder.metadata || "{}");

        setOrderDetails({
          orderId: metadata.orderGroupId || "Unknown",
          email: metadata.email || "Not provided",
        });
      }
    } catch (err) {
      console.error("Error checking payment:", err);
    } finally {
      setLoading(false);
    }
  }

  // If not a valid payment, show nothing (we'll redirect in useEffect)
  if (!validPayment) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center p-4'>
        <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-yellow border-r-transparent'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-lightBlack rounded-2xl p-8 relative overflow-hidden'>
        {/* Background glow effect */}
        <div className='absolute top-0 -right-20 h-40 w-40 rounded-full blur-[100px] bg-orange/30 z-0'></div>

        <div className='relative z-10 text-center py-8'>
          <AlertTriangle size={64} className='mx-auto mb-4 text-orange' />
          <h2 className='text-2xl font-bold text-white mb-4'>
            Partial Payment Detected
          </h2>

          <p className='text-gray-300 mb-6'>
            We've received a partial payment for your order. Please complete the
            payment to receive your items.
          </p>

          {orderDetails && (
            <div className='bg-black/30 rounded-lg p-4 mb-6 text-left'>
              <div className='flex justify-between mb-2'>
                <span className='text-gray-400'>Order ID:</span>
                <span className='text-white'>{orderDetails.orderId}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>Email:</span>
                <span className='text-white'>{orderDetails.email}</span>
              </div>
            </div>
          )}

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/cart'
              className='px-6 py-2 border border-yellow text-yellow rounded-lg hover:bg-yellow/10 transition-colors'
            >
              Return to Cart
            </Link>
            <Link
              href='/support'
              className='px-6 py-2 bg-yellow text-black rounded-lg hover:bg-yellow-400 transition-colors'
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
