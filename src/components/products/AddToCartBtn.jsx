"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export function AddToCartButton({ product, variant }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    // Here you would implement the logic to add the item to the cart
    // This could involve calling an API, updating local storage, etc.
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating an API call
    setIsAdding(false);
    alert("Item added to cart!");
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || variant.status === "out-of-stock"}
      className='bg-orange hover:bg-orange/70 text-black font-semibold w-full'
    >
      {isAdding ? "Adding..." : "Add to Cart"}
      <ShoppingCart className='ml-2 h-4 w-4' />
    </Button>
  );
}
