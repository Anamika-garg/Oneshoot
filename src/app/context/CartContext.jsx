"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Also load saved promo if exists
    const savedPromo = localStorage.getItem("appliedPromo");
    if (savedPromo) {
      setAppliedPromo(JSON.parse(savedPromo));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem("appliedPromo", JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem("appliedPromo");
    }
  }, [appliedPromo]);

  const addToCart = (item, quantity) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) =>
          cartItem.id === item.id && cartItem.variantId === item.variantId
      );
      if (existingItemIndex !== -1) {
        // If item exists, create a new array with the updated item
        return prevCart.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      // If item doesn't exist, add it to the cart
      return [...prevCart, { ...item, quantity }];
    });
  };

  const removeFromCart = (id, variantId) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.id === id && item.variantId === variantId)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Apply promo code discount if available
    if (appliedPromo) {
      if (appliedPromo.isPercentage) {
        return subtotal * (1 - appliedPromo.discount / 100);
      } else {
        return Math.max(0, subtotal - appliedPromo.discount);
      }
    }

    return subtotal;
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const applyPromoCode = (promoData) => {
    setAppliedPromo(promoData);
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const calculateDiscountAmount = (itemPrice, itemQuantity) => {
    if (!appliedPromo) return 0;

    const itemTotal = itemPrice * itemQuantity;
    const cartTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (appliedPromo.isPercentage) {
      return (itemTotal * appliedPromo.discount) / 100;
    } else {
      // For flat discounts, distribute proportionally across items
      return (itemTotal / cartTotal) * appliedPromo.discount;
    }
  };

  const recordPromoUsage = async (orderId) => {
    if (!appliedPromo) return;

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Record promo usage
      await fetch("/api/record-promo-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promoCode: appliedPromo.code,
          userId: user.id,
          orderId,
        }),
      });

      // Clear the applied promo after successful recording
      setAppliedPromo(null);
    } catch (error) {
      console.error("Error recording promo usage:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        calculateDiscountAmount,
        recordPromoUsage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
