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
import { client } from "@/lib/sanity";
import { cleanupDownloadLink } from "@/lib/sanity";
import PromoCodeInput from "@/app/cart/components/promo-code-input";

// Initialize Supabase client
const supabase = createClient();

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    clearCart,
    appliedPromo,
    removePromoCode,
    calculateDiscountAmount,
    recordPromoUsage,
  } = useCart();

  const [email, setEmail] = useState("");
  const [showNOWPayments, setShowNOWPayments] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        router.push("/account");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, router]);

  useEffect(() => {
    // Set email from user if available
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };

    getUser();
  }, []);

  const handleProceedToPayment = () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setShowNOWPayments(true);
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

  // Get available download links based on quantity and mark them as used
  // Returns an object with available links and a flag indicating if there are enough links
  const getAvailableDownloadLinks = async (productId, variantId, quantity) => {
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

    // First, get the current state of the product and variant
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

    // Get the links that will be used (based on quantity or all available if not enough)
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

      // Update the variant in Sanity via API route
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
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update download links");
        }

        // Wait for the response to ensure the update is complete
        await response.json();

        // Schedule cleanup for each link (but don't wait for it)
        try {
          for (let i = 0; i < linksToUse.length; i++) {
            const link = linksToUse[i];
            // Add a small delay between cleanup requests to prevent race conditions
            setTimeout(() => {
              cleanupDownloadLink(variantId, link.filePath, updatedLinks).catch(
                (error) => console.error("Error in cleanup:", error)
              );
            }, i * 300); // 300ms delay between each cleanup request
          }
        } catch (error) {
          console.error("Error scheduling cleanup:", error);
          // Don't throw here - we still want to return the links
        }
      } catch (error) {
        console.error("Error updating download links:", error);
        throw error;
      }
    }

    // Return an array of product details with download links and availability status
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
  };

  const handleTestPayment = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsProcessing(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        toast.error("Please sign in to complete the purchase");
        return;
      }

      // Generate a unique order reference (we'll use this in memory, not in the database)
      const orderGroupId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      // Array to collect all product details for the email
      const purchasedProducts = [];
      // Track if any products are pending
      let hasPendingProducts = false;

      // Process each cart item sequentially to avoid race conditions
      for (const item of cart) {
        const productStatus = await client.fetch(
          `*[_type == "product" && _id == $productId][0] {
          "variantStatus": variants[_id == $variantId].status
        }`,
          { productId: item.id, variantId: item.variantId }
        );

        const discountAmount = calculateDiscountAmount(
          item.price,
          item.quantity
        );

        // Get available download links based on quantity
        let productDetailsArray = [];
        let itemStatus = "paid";

        try {
          const result = await getAvailableDownloadLinks(
            item.id,
            item.variantId,
            item.quantity
          );

          productDetailsArray = result.productDetails;

          // If we don't have enough links, mark the order as pending
          if (!result.hasEnoughLinks) {
            itemStatus = "pending";
            hasPendingProducts = true;

            console.log(
              `Product ${item.name} has insufficient links. Available: ${result.availableCount}, Needed: ${result.neededCount}`
            );
          }

          // Add all product details to the array of purchased products
          purchasedProducts.push(...productDetailsArray);
        } catch (error) {
          console.error("Error getting download links:", error);
          // If there's an error getting links, still create the order but mark it as pending
          itemStatus = "pending";
          hasPendingProducts = true;
        }

        // Create order record with orderGroupId in metadata
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            product_id: item.id,
            variant_id: item.variantId,
            status: itemStatus,
            amount: item.price * item.quantity,
            promo_code: appliedPromo ? appliedPromo.code : null,
            discount_amount: discountAmount,
            metadata: JSON.stringify({
              available: productDetailsArray.length,
              needed: item.quantity,
              orderGroupId: orderGroupId,
            }),
            download_links: productDetailsArray, // <-- store the array of assigned download links
          })
          .select();

        if (orderError)
          throw new Error(`Failed to create order: ${orderError.message}`);

        // Create appropriate notification based on status
        let notificationMessage = "";

        if (itemStatus === "pending") {
          notificationMessage = `Your order for ${item.name} has been received. We'll notify you when it's ready for download.`;
        } else {
          notificationMessage = `Your order for ${item.name} has been successfully processed and is ready for download.`;
        }

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: user.id,
            message: notificationMessage,
            product_id: item.id,
            variant_id: item.variantId,
            order_id: orderData[0].id,
            read: false,
            email: user.email,
          });

        if (notificationError)
          throw new Error(
            `Failed to create notification: ${notificationError.message}`
          );

        // Add a small delay between processing items to avoid race conditions
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // If a promo code was applied, record its usage
      if (appliedPromo) {
        await recordPromoUsage(orderGroupId);
      }

      // Replace this entire block:
      if (purchasedProducts.length === 0 && hasPendingProducts) {
        console.log(
          "All products are pending, will send email without download links"
        );
      }

      // Send a single confirmation email with all products
      try {
        console.log(
          "Sending email with products:",
          JSON.stringify({
            email: user.email,
            products: purchasedProducts,
            orderId: orderGroupId,
            hasPendingProducts,
          })
        );

        const response = await fetch("/api/send-order-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            products: purchasedProducts,
            orderId: orderGroupId,
            hasPendingProducts,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Email API error:", errorData);
          throw new Error(
            errorData.error || "Failed to send confirmation email"
          );
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the whole process if email fails
        toast.error(
          "Order processed, but we couldn't send a confirmation email. Check your account for order details."
        );
      }

      clearCart();
      setShowSuccessPopup(true);

      if (hasPendingProducts) {
        toast.success(
          "Order processed! Some items are pending and will be delivered soon."
        );
      } else {
        toast.success("Payment processed successfully!");
      }
    } catch (error) {
      console.error("Error processing test payment:", error);
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setIsProcessing(false);
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
                    className='bg-transparent text-white border border-white/20 placeholder:text-gray-400 focus:border-yellow focus:0'
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
                        <PromoCodeInput />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {appliedPromo && (
                    <div className='mt-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20'>
                      <div className='flex justify-between items-center'>
                        <span className='text-green-500'>
                          {appliedPromo.code} -{" "}
                          {appliedPromo.isPercentage
                            ? `${appliedPromo.discount}% off`
                            : `$${appliedPromo.discount.toFixed(2)} off`}
                        </span>
                        <button
                          onClick={removePromoCode}
                          className='text-red-500 hover:text-red-400 text-sm'
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
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
                    disabled={isProcessing}
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    className='rounded-lg bg-yellow px-6 py-2 text-black transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                    tabIndex={0}
                    aria-label='Proceed to crypto payment'
                    disabled={isProcessing}
                  >
                    Pay Now
                  </button>
                  <button
                    onClick={handleTestPayment}
                    className='rounded-lg bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400'
                    tabIndex={0}
                    aria-label='Process test payment'
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Test Payment"}
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
