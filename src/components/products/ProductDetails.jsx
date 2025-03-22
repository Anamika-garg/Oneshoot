"use client";

import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/products/AddToCartBtn";
import { Check, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";

export const ProductDetails = ({
  product,
  variant,
  category,
  includedFeatures,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [imageSrc, setImageSrc] = useState(product.image || "/placeholder.svg");
  const router = useRouter();
  const { user } = useAuth();

  // Add cache-busting for the image
  useEffect(() => {
    if (product.image) {
      // Add a timestamp to bust cache
      const cacheBuster = `${product.image}${product.image.includes("?") ? "&" : "?"}t=${Date.now()}`;
      setImageSrc(cacheBuster);
    }
  }, [product.image]);

  const handleQuantityChange = (event) => {
    const value = event.target.value;
    // Allow empty input for typing purposes
    if (value === "") {
      setQuantity("");
      return;
    }

    // Convert to number and validate
    const numValue = Number.parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setQuantity(numValue);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => (typeof prev === "number" ? prev + 1 : 1));
  };

  const decrementQuantity = () => {
    setQuantity((prev) =>
      typeof prev === "number" && prev > 1 ? prev - 1 : 1
    );
  };

  // Ensure quantity is a valid number when submitting
  const getValidQuantity = () => {
    return typeof quantity === "number" && quantity > 0 ? quantity : 1;
  };

  const handleLoginClick = () => {
    router.push("/login?mode=login");
  };

  // Handle blur to validate empty input
  const handleBlur = () => {
    if (quantity === "" || typeof quantity !== "number" || quantity < 1) {
      setQuantity(1);
    }
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-6 lg:gap-12'>
      {/* Left Column - Product Card */}
      <div className='relative rounded-2xl bg-transparent sm:px-4 p-6'>
        {/* Price Tag */}
        <div className='absolute top-2 left-1/2 -translate-x-1/2 bg-orange px-4 sm:px-6 py-1 rounded-md shadow-md z-10'>
          <span className='text-black font-bold text-lg sm:text-2xl'>
            ${variant.price}
          </span>
        </div>

        {/* Product Image */}
        <div className='relative w-full h-auto max-h-[400px] aspect-[4/3] sm:aspect-[16/9] mb-4 sm:mb-6 overflow-hidden rounded-xl bg-lightBlack'>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            layout='fill'
            objectFit='cover'
            className='w-full h-full object-cover border border-orange rounded-xl'
          />
        </div>

        {/* Quantity & Actions */}
        <div className='space-y-4 w-full'>
          <div className='space-y-2'>
            <label
              className='text-white text-base sm:text-lg'
              htmlFor='quantity-input'
            >
              Quantity
            </label>

            {/* Custom quantity input with buttons */}
            <div className='flex items-center'>
              <button
                type='button'
                onClick={decrementQuantity}
                className='bg-lightBlack text-white px-3 py-3 rounded-l-2xl border border-zinc-800 hover:bg-zinc-800 focus:outline-none focus:border-orange'
                aria-label='Decrease quantity'
              >
                <Minus className='w-4 h-4' />
              </button>

              <input
                id='quantity-input'
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleBlur}
                className='w-full bg-lightBlack text-white text-center py-3 border-y border-zinc-800 focus:outline-none focus:border-orange'
                aria-label='Enter quantity'
              />

              <button
                type='button'
                onClick={incrementQuantity}
                className='bg-lightBlack text-white px-3 py-3 rounded-r-2xl border border-zinc-800 hover:bg-zinc-800 focus:outline-none focus:border-orange'
                aria-label='Increase quantity'
              >
                <Plus className='w-4 h-4' />
              </button>
            </div>
          </div>

          {user ? (
            <AddToCartButton
              product={product}
              variant={variant}
              quantity={getValidQuantity()}
              className='w-full bg-orange text-black py-3 rounded-md font-semibold hover:bg-orange/90 transition-colors'
            />
          ) : (
            <button
              onClick={handleLoginClick}
              className='w-full bg-yellow px-6 py-3 text-black rounded-md font-semibold hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400'
            >
              Login to Purchase
            </button>
          )}
        </div>
      </div>

      {/* Right Column - Product Details */}
      <div className='space-y-6 sm:space-y-8 px-4 sm:px-0'>
        <div>
          <div className='inline-block bg-orange px-3 sm:px-4 py-1 rounded-md mb-4 sm:mb-6'>
            <span className='text-black font-medium text-lg sm:text-xl'>
              INCLUDED:
            </span>
          </div>

          <ul className='space-y-3 sm:space-y-4 text-base sm:text-lg'>
            {includedFeatures.map((feature, i) => (
              <li key={i} className='flex items-center gap-3'>
                <Check className='h-6 sm:h-8 w-6 sm:w-8 text-orange' />
                <span className='text-gray-200'>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className='space-y-3 sm:space-y-4 text-lg sm:text-xl'>
          <div className='flex justify-between items-center border border-t-white/10 border-b-white/10 border-x-0 py-3 sm:py-4'>
            <span className='text-white'>Status:</span>
            <span className='bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent capitalize'>
              {variant.status}
            </span>
          </div>
          <div className='flex justify-between items-center border border-b-white/10 border-x-0 border-t-0 pb-3 sm:pb-4'>
            <span className='text-white'>Category:</span>
            <span className='bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent uppercase'>
              {category ? product.category : "Uncategorized"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
