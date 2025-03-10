"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductCard({ product, onClick, index, total }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1], // Custom easing function for a smooth slide
        delay: index * 0.1, // Delay each card's animation based on its index
      }}
      className='relative rounded-xl bg-lightBlack overflow-hidden group font-manrope cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange transition-all h-full'
      onClick={() => onClick(product)}
    >
      <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-gradientStart via-gradientMid to-gradientStart opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

      <div className='relative z-10 p-[1px] rounded-xl h-full'>
        <div className='bg-lightBlack rounded-xl p-3 flex flex-col h-full'>
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 z-10'>
            <div className='bg-orange text-black font-bold text-sm px-4 py-1 whitespace-nowrap'>
              from {product.basePrice}$
            </div>
          </div>

          <div className='relative w-full pt-[60%] overflow-hidden'>
            <div className='absolute inset-0'>
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className='object-cover border border-orange'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
                priority={false}
              />
              <div className='absolute inset-0 overflow-hidden'>
                <div className='absolute -left-full top-full w-[200%] h-[3px] bg-gradient-to-r from-[#FFDD55] via-[#CF7B17] to-[#FFDD55] rotate-45 group-hover:translate-x-full group-hover:-translate-y-full transition-all duration-700 ease-out' />
              </div>
            </div>
          </div>

          <div className='mt-4 flex-grow flex flex-col justify-between space-y-4'>
            <h4 className='text-2xl text-white uppercase font-extrabold line-clamp-2'>
              {product.name}
            </h4>

            {/* Modified this section to be more responsive */}
            <div className='flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 lg:gap-4 xl:gap-2'>
              <div className='space-y-1 max-w-[60%] sm:max-w-[50%] md:max-w-[45%] lg:max-w-[40%]'>
                <p className='text-orange text-sm'>Category:</p>
                <p className='text-white text-sm truncate'>
                  {product.category}
                </p>
              </div>
              <Button
                className='bg-orange hover:bg-orange/70 text-black font-semibold text-sm py-1.5 px-3 whitespace-nowrap w-full sm:w-auto flex-shrink-0'
                aria-label={`Buy ${product.name}`}
              >
                Buy Now <ShoppingCart className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
