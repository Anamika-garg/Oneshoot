"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, Clock, Bell } from "lucide-react";

const supabase = createClient();

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
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

  // Function to check payment status
  const checkPaymentStatus = async () => {
    try {
      if (!paymentId) {
        setError("No payment reference found");
        setLoading(false);
        return;
      }

      console.log("Checking payment status for:", paymentId);

      // Check if we have any orders with this payment ID
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .textSearch("metadata", paymentId);

      if (ordersError) {
        console.error("Database error:", ordersError);
        setError("Failed to verify payment");
        setLoading(false);
        return;
      }

      console.log("Found orders:", orders?.length || 0);

      if (!orders || orders.length === 0) {
        // No orders found yet - this could be because the webhook hasn't processed yet
        setError("Payment is being processed. Please wait a moment.");
        setLoading(false);
        return;
      }

      // Get the first order for display
      const firstOrder = orders[0];
      setOrder({
        id: firstOrder.id,
        status: firstOrder.status,
        amount: firstOrder.amount,
        metadata: JSON.parse(firstOrder.metadata || "{}"),
        email:
          firstOrder.email || JSON.parse(firstOrder.metadata || "{}").email,
        user_id: firstOrder.user_id,
      });

      // Fetch notifications for this user
      if (firstOrder.user_id) {
        const { data: notificationData, error: notificationError } =
          await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", firstOrder.user_id)
            .eq("read", false)
            .order("created_at", { ascending: false });

        if (!notificationError && notificationData) {
          setNotifications(notificationData);
        }
      }
    } catch (err) {
      console.error("Error checking payment:", err);
      setError("An error occurred while verifying your payment");
    } finally {
      setLoading(false);
    }
  };

  // Validate payment on initial load
  useEffect(() => {
    const validate = async () => {
      const isValid = await validatePayment();
      setValidPayment(isValid);

      if (isValid) {
        checkPaymentStatus();
      }
    };

    validate();
  }, [paymentId]);

  // Check payment status on load and set up polling
  useEffect(() => {
    if (!validPayment) return;

    // Set up a polling mechanism to check status every few seconds
    // This helps in case the webhook hasn't processed yet
    const intervalId = setInterval(() => {
      if (order?.status === "pending_payment") {
        checkPaymentStatus();
      } else {
        clearInterval(intervalId);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [paymentId, order?.status, validPayment]);

  // If not a valid payment, show nothing (we'll redirect in useEffect)
  if (!validPayment) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center p-4'>
        <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-yellow border-r-transparent'></div>
      </div>
    );
  }

  // Function to manually trigger webhook processing
  const triggerWebhookProcessing = async () => {
    if (!order?.metadata?.nowpayments_invoice_id) return;

    try {
      setLoading(true);

      // Call your backend to check the payment status with NOWPayments API
      const response = await fetch("/api/check-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: order.metadata.nowpayments_invoice_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check payment status");
      }

      // Refresh the order data
      checkPaymentStatus();
    } catch (err) {
      console.error("Error triggering webhook:", err);
      setError("Failed to update payment status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-lightBlack rounded-2xl p-8 relative overflow-hidden'>
        {/* Background glow effect */}
        <div className='absolute top-0 -right-20 h-40 w-40 rounded-full blur-[100px] bg-yellow/30 z-0'></div>

        <div className='relative z-10 text-center'>
          <h2 className='text-2xl font-bold text-white mb-4'>
            Payment Received
          </h2>

          {loading ? (
            <div className='py-8'>
              <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-yellow border-r-transparent'></div>
              <p className='mt-4 text-gray-300'>Verifying your payment...</p>
            </div>
          ) : error ? (
            <div className='py-8'>
              <Clock className='mx-auto h-16 w-16 text-yellow mb-4' />
              <p className='text-gray-300 mb-6'>{error}</p>
              <p className='text-sm text-gray-400 mb-6'>
                Your payment is being processed. This may take a few minutes.
                You will receive an email confirmation once your order is ready.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button
                  onClick={checkPaymentStatus}
                  className='px-6 py-2 border border-yellow text-yellow rounded-lg hover:bg-yellow/10 transition-colors'
                  disabled={loading}
                >
                  Check Again
                </button>
                <Link
                  href='/account'
                  className='px-6 py-2 bg-yellow text-black rounded-lg hover:bg-yellow-400 transition-colors'
                >
                  Go to My Account
                </Link>
              </div>
            </div>
          ) : order ? (
            <div className='py-8'>
              {order.status === "pending_payment" ? (
                <>
                  <Clock className='mx-auto h-16 w-16 text-yellow mb-4' />
                  <p className='text-gray-300 mb-4'>
                    Your payment has been received and is being processed.
                  </p>
                  <div className='bg-black/30 rounded-lg p-4 mb-6 text-left'>
                    <div className='flex justify-between mb-2'>
                      <span className='text-gray-400'>Order ID:</span>
                      <span className='text-white'>
                        {order.metadata.orderGroupId || "N/A"}
                      </span>
                    </div>
                    <div className='flex justify-between mb-2'>
                      <span className='text-gray-400'>Amount:</span>
                      <span className='text-white'>${order.amount}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Email:</span>
                      <span className='text-white'>{order.email}</span>
                    </div>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <button
                      onClick={triggerWebhookProcessing}
                      className='px-6 py-2 border border-yellow text-yellow rounded-lg hover:bg-yellow/10 transition-colors'
                      disabled={loading}
                    >
                      Update Status
                    </button>
                    <Link
                      href='/account'
                      className='px-6 py-2 bg-yellow text-black rounded-lg hover:bg-yellow-400 transition-colors'
                    >
                      Go to My Account
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className='mx-auto h-16 w-16 text-green-500 mb-4' />
                  <p className='text-gray-300 mb-4'>
                    Thank you for your purchase! Your order has been processed
                    successfully.
                  </p>
                  <div className='bg-black/30 rounded-lg p-4 mb-6 text-left'>
                    <div className='flex justify-between mb-2'>
                      <span className='text-gray-400'>Order ID:</span>
                      <span className='text-white'>
                        {order.metadata.orderGroupId || "N/A"}
                      </span>
                    </div>
                    <div className='flex justify-between mb-2'>
                      <span className='text-gray-400'>Amount:</span>
                      <span className='text-white'>${order.amount}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Email:</span>
                      <span className='text-white'>{order.email}</span>
                    </div>
                  </div>

                  {notifications.length > 0 && (
                    <div className='mb-6'>
                      <div className='flex items-center justify-center mb-2'>
                        <Bell className='h-5 w-5 text-yellow mr-2' />
                        <h3 className='text-white font-medium'>
                          Notifications
                        </h3>
                      </div>
                      <div className='bg-black/30 rounded-lg p-4 text-left max-h-40 overflow-y-auto'>
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className='mb-2 pb-2 border-b border-gray-800 last:border-0 last:mb-0 last:pb-0'
                          >
                            <p className='text-gray-300 text-sm'>
                              {notification.message}
                            </p>
                            <p className='text-gray-500 text-xs mt-1'>
                              {new Date(
                                notification.created_at
                              ).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href='/account'
                    className='px-6 py-2 bg-yellow text-black rounded-lg hover:bg-yellow-400 transition-colors'
                  >
                    View My Purchases
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className='py-8'>
              <p className='text-gray-300 mb-6'>
                No order information found. If you've just completed a payment,
                please wait a moment and refresh this page.
              </p>
              <div className='flex justify-center gap-4'>
                <button
                  onClick={checkPaymentStatus}
                  className='px-6 py-2 border border-yellow text-yellow rounded-lg hover:bg-yellow/10 transition-colors'
                >
                  Check Again
                </button>
                <Link
                  href='/account'
                  className='px-6 py-2 bg-yellow text-black rounded-lg hover:bg-yellow-400 transition-colors'
                >
                  Go to My Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
