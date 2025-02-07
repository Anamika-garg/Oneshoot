"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useCart } from "@/app/context/CartContext";
import NOWPaymentsCheckout from "./NOWPaymentCheckout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Checkmark } from "./ui/Checkmark";
import { client as sanityClient, getPromoCode } from "@/lib/sanity";

// Initialize Supabase client
const supabase = createClient();

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [showNOWPayments, setShowNOWPayments] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showPromoInput, setShowPromoInput] = useState(false);

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        router.push("/account");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, router]);

  const handleProceedToPayment = () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setShowNOWPayments(true);
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    try {
      const promoData = await getPromoCode(promoCode);
      if (!promoData) {
        toast.error("Invalid promo code");
        return;
      }

      const now = new Date();
      if (promoData.validFrom && new Date(promoData.validFrom) > now) {
        toast.error("This promo code is not yet valid");
        return;
      }
      if (promoData.validTo && new Date(promoData.validTo) < now) {
        toast.error("This promo code has expired");
        return;
      }

      setAppliedPromo(promoData);
      toast.success("Promo code applied successfully");
    } catch (error) {
      console.error("Error applying promo code:", error);
      toast.error("Failed to apply promo code");
    }
  };

  const calculateTotal = () => {
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (appliedPromo) {
      if (appliedPromo.isPercentage) {
        total *= 1 - appliedPromo.discount / 100;
      } else {
        total = Math.max(0, total - appliedPromo.discount);
      }
    }
    return total.toFixed(2);
  };

  const handleTestPayment = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        toast.error("Please sign in to complete the purchase");
        return;
      }

      for (const item of cart) {
        const productStatus = await sanityClient.fetch(
          `*[_type == "product" && _id == $productId][0] {
            "variantStatus": variants[_id == $variantId].status
          }`,
          { productId: item.id, variantId: item.variantId }
        );

        const { error: orderError } = await supabase.from("orders").insert({
          user_id: user.id,
          product_id: item.id,
          variant_id: item.variantId,
          status: "paid",
          amount: item.price * item.quantity,
          promo_code: appliedPromo ? appliedPromo.code : null,
          discount_amount: appliedPromo
            ? appliedPromo.isPercentage
              ? (item.price * item.quantity * appliedPromo.discount) / 100
              : appliedPromo.discount
            : 0,
        });

        if (orderError)
          throw new Error(`Failed to create order: ${orderError.message}`);

        const notificationMessage =
          productStatus.variantStatus === "available"
            ? `Your order for ${item.name} has been successfully placed and will be delivered soon.`
            : `Your order for ${item.name} has been received. We'll notify you when it's ready for delivery.`;

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: user.id,
            message: notificationMessage,
            product_id: item.id,
            read: false,
            email: user.email,
          });

        if (notificationError)
          throw new Error(
            `Failed to create notification: ${notificationError.message}`
          );
      }

      clearCart();
      setShowSuccessPopup(true);
      toast.success("Payment processed successfully!");
    } catch (error) {
      console.error("Error processing test payment:", error);
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className='min-h-screen bg-black px-4 py-16 md:py-20 relative'>
      <div className='mx-auto max-w-4xl relative z-20'>
        <motion.div
          initial='hidden'
          animate='visible'
          className='mb-12 text-center'
        >
          <h2 className='mb-2 text-lg font-medium text-yellow-500'>BASKET</h2>
          <p className='text-4xl font-bold tracking-wider text-white'>
            YOUR SHOPPING CART
          </p>
        </motion.div>

        {cart.length === 0 ? (
          <p className='text-center text-base uppercase text-white'>
            Your cart is empty.
          </p>
        ) : (
          <div className='space-y-8'>
            <div className='rounded-2xl bg-lightBlack p-3'>
              <div className='mb-4 grid grid-cols-[2fr,1fr,1fr] gap-4 text-zinc-400 bg-[#191919] w-full px-6 py-3'>
                <div>Product</div>
                <div className='text-center'>Quantity</div>
                <div className='text-right'>Total</div>
              </div>

              <div className='divide-y divide-zinc-800 p-2 sm:p-6'>
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.variantId}`}
                    className='grid grid-cols-[2fr,1fr,1fr] gap-4 py-4'
                  >
                    <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                      <div className='h-16 w-16 overflow-hidden rounded-lg border border-zinc-800'>
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className='h-full w-full object-contain'
                        />
                      </div>
                      <div>
                        <h3 className='font-medium text-white'>{item.name}</h3>
                        <p className='text-sm text-gray-400'>
                          {item.variantName}
                        </p>
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.variantId)
                          }
                          className='mt-1 text-sm text-red-500 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500'
                          tabIndex={0}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className='flex items-center justify-center text-white'>
                      {item.quantity}
                    </div>
                    <div className='flex items-center justify-end bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-2xl bg-lightBlack p-6'>
              <h2 className='mb-4 text-xl sm:text-2xl font-bold text-white'>
                CHECKOUT
              </h2>
              <div className='space-y-4'>
                <div>
                  <label htmlFor='email' className='mb-2 block text-white'>
                    Email
                  </label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Delivery mail'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='bg-transparent text-white border border-white/20 placeholder:text-gray-400 focus:border-yellow focus:ring-0'
                    aria-label='Email for delivery'
                  />
                </div>
                <div>
                  <button
                    onClick={() => setShowPromoInput(!showPromoInput)}
                    className='text-orange hover:text-yellow focus:outline-none '
                  >
                    Do you have a promo?
                  </button>
                  <AnimatePresence>
                    {showPromoInput && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className='overflow-hidden'
                      >
                        <div className='flex gap-2 mt-2'>
                          <Input
                            id='promoCode'
                            type='text'
                            placeholder='Enter promo code'
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className='bg-transparent text-white border border-white/20 placeholder:text-gray-400 focus:border-yellow focus:ring-0'
                            aria-label='Promo code'
                          />
                          <button
                            onClick={applyPromoCode}
                            className='rounded-lg bg-yellow px-4 py-2 text-black transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                            tabIndex={0}
                            aria-label='Apply promo code'
                          >
                            Apply
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className='flex items-center justify-between pt-4'>
                  <span className='text-xl font-medium text-white'>Total</span>
                  <div className='text-right'>
                    {appliedPromo && (
                      <span className='text-sm text-green-500 block'>
                        Discount:{" "}
                        {appliedPromo.isPercentage
                          ? `${appliedPromo.discount}%`
                          : `$${appliedPromo.discount.toFixed(2)}`}
                      </span>
                    )}
                    <span className='text-xl font-medium bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
                <div className='flex flex-col sm:flex-row justify-end gap-4'>
                  <button
                    onClick={clearCart}
                    className='rounded-lg border border-red-500 px-6 py-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500'
                    tabIndex={0}
                    aria-label='Clear cart'
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    className='rounded-lg bg-yellow px-6 py-2 text-black transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                    tabIndex={0}
                    aria-label='Proceed to crypto payment'
                  >
                    Pay Now
                  </button>
                  <button
                    onClick={handleTestPayment}
                    className='rounded-lg bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400'
                    tabIndex={0}
                    aria-label='Process test payment'
                  >
                    Test Payment
                  </button>
                </div>
              </div>
            </div>
            {showNOWPayments && (
              <NOWPaymentsCheckout
                amount={calculateTotal()}
                email={email}
                onClose={() => setShowNOWPayments(false)}
              />
            )}
          </div>
        )}
      </div>

      <div className='absolute top-1/2 md:top-10 -right-20 md:-right-40 h-80 md:h-[420px] w-80 md:w-[420px] rounded-full blur-[220px] md:blur-[320px] pointer-events-none bg-orange z-0'></div>
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className='bg-white rounded-lg p-8 max-w-sm w-full text-center'
            >
              <Checkmark
                size={80}
                strokeWidth={4}
                color='rgb(16 185 129)'
                className='mx-auto mb-4'
              />
              <h2 className='text-2xl font-bold mb-4'>Payment Successful</h2>
              <p className='mb-4'>
                Your order has been processed successfully.
              </p>
              <p className='text-sm text-gray-500'>
                Redirecting to account page...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
