"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { Checkmark } from "@/components/ui/Checkmark";

const supabase = createClient();

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState("processing");
  const router = useRouter();

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        // Get the order ID from localStorage
        const orderGroupId = localStorage.getItem("currentOrderId");

        if (!orderGroupId) {
          // If no order ID, redirect to account page after a delay
          setTimeout(() => router.push("/account"), 3000);
          return;
        }

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // If no user, redirect to account page after a delay
          setTimeout(() => router.push("/account"), 3000);
          return;
        }

        // Query orders with this orderGroupId in metadata
        const { data: orders, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .textSearch("metadata", orderGroupId);

        if (error) {
          console.error("Error fetching orders:", error);
          setOrderStatus("unknown");
          return;
        }

        if (!orders || orders.length === 0) {
          setOrderStatus("not_found");
          return;
        }

        // Determine overall status
        const allPaid = orders.every((order) => order.status === "paid");
        const anyPaid = orders.some((order) => order.status === "paid");
        const anyFailed = orders.some((order) =>
          ["failed", "expired", "refunded"].includes(order.status)
        );

        if (allPaid) {
          setOrderStatus("completed");
        } else if (anyPaid) {
          setOrderStatus("partially_completed");
        } else if (anyFailed) {
          setOrderStatus("failed");
        } else {
          setOrderStatus("processing");
        }
      } catch (error) {
        console.error("Error checking order status:", error);
        setOrderStatus("error");
      } finally {
        setLoading(false);
      }
    };

    checkOrderStatus();

    // Check status every 5 seconds
    const interval = setInterval(checkOrderStatus, 5000);

    // Clear interval on unmount
    return () => clearInterval(interval);
  }, [router]);

  // Redirect to account page after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/account");
    }, 30000);

    return () => clearTimeout(timer);
  }, [router]);

  const getStatusMessage = () => {
    switch (orderStatus) {
      case "completed":
        return {
          title: "Payment Successful!",
          message:
            "Your order has been processed successfully. You can download your products from your account page.",
          color: "rgb(16 185 129)",
        };
      case "partially_completed":
        return {
          title: "Payment Partially Processed",
          message:
            "Some of your items are ready. We're still processing the rest of your order.",
          color: "rgb(249 115 22)",
        };
      case "processing":
        return {
          title: "Payment Received",
          message:
            "We've received your payment and are processing your order. This may take a few minutes.",
          color: "rgb(255 221 85)",
        };
      case "failed":
        return {
          title: "Payment Issue",
          message:
            "There was an issue with your payment. Please check your account for details.",
          color: "rgb(239 68 68)",
        };
      case "not_found":
        return {
          title: "Order Not Found",
          message:
            "We couldn't find your order. Please contact support if you believe this is an error.",
          color: "rgb(239 68 68)",
        };
      default:
        return {
          title: "Processing Payment",
          message:
            "We're checking the status of your payment. Please wait a moment.",
          color: "rgb(255 221 85)",
        };
    }
  };

  const status = getStatusMessage();

  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-4'>
      <div className='bg-lightBlack rounded-2xl p-8 max-w-md w-full text-center'>
        {loading ? (
          <div className='animate-pulse flex flex-col items-center'>
            <div className='w-20 h-20 rounded-full bg-gray-700 mb-4'></div>
            <div className='h-6 bg-gray-700 rounded w-3/4 mb-4'></div>
            <div className='h-4 bg-gray-700 rounded w-full mb-2'></div>
            <div className='h-4 bg-gray-700 rounded w-5/6'></div>
          </div>
        ) : (
          <>
            <Checkmark
              size={80}
              strokeWidth={4}
              color={status.color}
              className='mx-auto mb-4'
            />
            <h2 className='text-2xl font-bold mb-4 text-white'>
              {status.title}
            </h2>
            <p className='mb-6 text-gray-300'>{status.message}</p>
            <div className='flex justify-center gap-4'>
              <button
                onClick={() => router.push("/account")}
                className='px-6 py-2 bg-yellow text-black rounded-lg hover:bg-yellow-400 transition-colors'
              >
                Go to My Account
              </button>
            </div>
            <p className='text-sm text-gray-500 mt-6'>
              You'll be redirected to your account page automatically...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
