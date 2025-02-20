"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/products/AddToCartBtn";
import { ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext"; // Assuming you have an AuthContext

export const ProductDetails = ({
  product,
  variant,
  category,
  includedFeatures,
}) => {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { user } = useAuth(); // Get the user from AuthContext

  const handleQuantityChange = (event) => {
    setQuantity(Number(event.target.value));
  };

  const handleLoginClick = () => {
    router.push("/login?mode=login");
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
      {/* Left Column - Product Card */}
      <div className='relative rounded-2xl bg-transparent p-6'>
        <div className='relative h-[300px] mb-6 p-6 overflow-hidden rounded-xl bg-lightBlack'>
          <div className='absolute top-0 left-1/2 -translate-x-1/2 bg-orange px-6 py-1 '>
            <span className='text-black font-bold text-2xl'>
              ${variant.price}
            </span>
          </div>
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className='w-full h-full object-cover border border-orange'
          />
        </div>

        <div className='space-y-4 w-full'>
          <div className='space-y-2'>
            <label className='text-white text-lg' htmlFor='quantity-select'>
              Quantity
            </label>
            <div className='relative'>
              <select
                id='quantity-select'
                value={quantity}
                onChange={handleQuantityChange}
                className='w-full bg-lightBlack text-white px-4 py-3 rounded-2xl appearance-none border border-zinc-800 focus:outline-none focus:border-orange'
                aria-label='Select quantity'
              >
                <option value='1'>1</option>
                <option value='2'>2</option>
                <option value='3'>3</option>
              </select>
              <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-orange' />
            </div>
          </div>

          {user ? (
            <AddToCartButton
              product={product}
              variant={variant}
              quantity={quantity}
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
      <div className='space-y-8'>
        <div>
          <div className='inline-block bg-orange px-4 py-1 rounded-md mb-6'>
            <span className='text-black font-medium text-xl'>INCLUDED:</span>
          </div>

          <ul className='space-y-4 text-lg'>
            {includedFeatures.map((feature, i) => (
              <li key={i} className='flex items-center gap-3'>
                <Check className='h-8 w-8 text-orange' />
                <span className='text-gray-200'>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className='space-y-4 text-xl'>
          <div className='flex justify-between items-center border border-t-white/10 border-b-white/10 border-x-0 py-4'>
            <span className='text-white'>Status:</span>
            <span className='bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent capitalize'>
              {variant.status}
            </span>
          </div>
          <div className='flex justify-between items-center border border-b-white/10 border-x-0 border-t-0 pb-4 '>
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
