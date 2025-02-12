"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBasket } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useCustomToast } from "@/hooks/useCustomToast";
import { useRouter } from "next/navigation";

export const AddToCartButton = ({
  product,
  variant,
  quantity,
  className = "",
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, removeFromCart } = useCart();
  const router = useRouter();
  const customToast = useCustomToast();

  const handleAddToCart = () => {
    setIsAdding(true);
    const item = {
      id: product._id,
      variantId: variant._id,
      name: product.name,
      variantName: variant.name,
      price: variant.price,
      image: product.image,
    };

    addToCart(item, quantity);

    customToast.custom(
      (t) => (
        <div className='flex flex-col'>
          <div className='flex items-center'>
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className='w-16 h-16 object-cover rounded mr-4'
            />
            <div>
              <h3 className='font-bold'>{product.name}</h3>
              <p>
                {variant.name} - ${variant.price}
              </p>
              <p>Quantity: {quantity}</p>
            </div>
          </div>
          <div className='flex justify-end mt-4 space-x-2'>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => {
                removeFromCart(item.id, item.variantId, quantity);
                customToast.success("Item removed from cart");
                t.dismiss();
              }}
            >
              Undo
            </Button>
            <Button
              variant='default'
              size='sm'
              onClick={() => {
                router.push("/cart");
                t.dismiss();
              }}
            >
              View Cart
            </Button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        style: {
          background: "#FFB528",
          color: "black",
        },
      }
    );

    setIsAdding(false);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || variant.status === "out-of-stock"}
      className={`bg-orange hover:bg-orange/70 text-black font-semibold w-full ${className}`}
      aria-label={`Add ${quantity} of ${variant.name} to cart`}
    >
      {isAdding ? "Adding..." : `Add ${quantity} to Cart`}
      <ShoppingBasket className='ml-2 h-4 w-4' />
    </Button>
  );
};
