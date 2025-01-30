"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBasket } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export const AddToCartButton = ({ product, variant, quantity, className }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(
      {
        id: variant.id,
        name: variant.name,
        price: variant.price,
      },
      quantity
    );
    setIsAdding(false);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || variant.status === "out-of-stock"}
      className={`bg-orange hover:bg-orange/70 text-black font-semibold w-full ${className}`}
      aria-label={`Add ${quantity} of ${variant.name} to cart`}
      tabIndex='0'
      onKeyDown={(e) => {
        if (e.key === "Enter") handleAddToCart();
      }}
    >
      {isAdding ? "Adding..." : `Add ${quantity} to Cart`}
      <ShoppingBasket className='ml-2 h-4 w-4' />
    </Button>
  );
};
