"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useCart } from "@/app/context/CartContext";
import NOWPaymentsCheckout from "./NOWPaymentCheckout";

export default function CartPage() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const { cart, removeFromCart, clearCart, getCartTotal } = useCart();
  const [email, setEmail] = useState("");
  const [showNOWPayments, setShowNOWPayments] = useState(false);

  const handleProceedToPayment = () => {
    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }
    setShowNOWPayments(true);
  };

  return (
    <div
      className='min-h-screen bg-black px-4 py-12 md:py-20 relative'
      ref={sectionRef}
    >
      <div className='mx-auto max-w-4xl relative z-20'>
        <motion.div
          initial='hidden'
          animate={isInView ? "visible" : "hidden"}
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

              <div className='divide-y divide-zinc-800 p-6'>
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.variantId}`}
                    className='grid grid-cols-[2fr,1fr,1fr] gap-4 py-4'
                  >
                    <div className='flex items-center gap-4'>
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
                          tabIndex='0'
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
              <h2 className='mb-4 text-2xl font-bold text-white'>CHECKOUT</h2>
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
                    className='bg-transparent text-white border border-white/20 placeholder:text-gray-400 focus:border-none focus:ring-0 focus-visible:ring-offset-1'
                    aria-label='Email for delivery'
                  />
                </div>
                <div className='flex items-center justify-between pt-4'>
                  <span className='text-xl font-medium text-white'>Total</span>
                  <span className='text-xl font-medium bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-end gap-4'>
                  <button
                    onClick={clearCart}
                    className='rounded-lg border border-red-500 px-6 py-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500'
                    tabIndex='0'
                    aria-label='Clear cart'
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    className='rounded-lg bg-yellow px-6 py-2 text-black transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                    tabIndex='0'
                    aria-label='Proceed to crypto payment'
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
            {showNOWPayments && (
              <NOWPaymentsCheckout
                amount={getCartTotal()}
                email={email}
                onClose={() => setShowNOWPayments(false)}
              />
            )}
          </div>
        )}
      </div>
      <div className='absolute top-1/2 md:top-10 -right-20 md:-right-40 h-80 md:h-[420px] w-80 md:w-[420px] rounded-full blur-[220px] md:blur-[320px] pointer-events-none bg-orange z-0'></div>
    </div>
  );
}
