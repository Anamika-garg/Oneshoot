"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";

export default function CartPage() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const { cart, removeFromCart, clearCart, getCartTotal } = useCart();

  return (
    <main
      className='container mx-auto px-4 py-20 bg-black min-h-screen'
      ref={sectionRef}
    >
      <motion.div
        initial='hidden'
        animate={isInView ? "visible" : "hidden"}
        custom={0}
        className='text-center mb-12'
      >
        <h2 className='text-xl font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent mb-2'>
          OUR OFFERS
        </h2>
        <p className='text-4xl font-bold text-white tracking-wider'>
          YOUR SHOPPING CART
        </p>
      </motion.div>
      {cart.length === 0 ? (
        <p className='text-white uppercase text-center text-base'>
          Your cart is empty.
        </p>
      ) : (
        <>
          <ul className='divide-y divide-gray-200'>
            {cart.map((item) => (
              <li key={item.id} className='py-4 flex justify-between'>
                <div>
                  <h2 className='text-lg font-semibold'>{item.name}</h2>
                  <p className='text-gray-500'>Quantity: {item.quantity}</p>
                  <p className='text-gray-500'>
                    Price: ${item.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className='text-red-500 hover:text-red-700'
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className='mt-8'>
            <p className='text-xl font-semibold text-yellow'>
              Total: ${getCartTotal().toFixed(2)}
            </p>
            <div className='mt-4 space-x-4'>
              <button
                onClick={clearCart}
                className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
              >
                Clear Cart
              </button>
              <Link
                href='/checkout'
                className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
