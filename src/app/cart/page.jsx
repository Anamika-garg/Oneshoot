"use client"


import Link from "next/link"
import { useCart } from "../context/CartContext"

export default function CartPage() {
  const { cart, removeFromCart, clearCart, getCartTotal } = useCart()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {cart.map((item) => (
              <li key={item.id} className="py-4 flex justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-500">Quantity: {item.quantity}</p>
                  <p className="text-gray-500">Price: ${item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <p className="text-xl font-semibold">Total: ${getCartTotal().toFixed(2)}</p>
            <div className="mt-4 space-x-4">
              <button onClick={clearCart} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Clear Cart
              </button>
              <Link href="/checkout" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

