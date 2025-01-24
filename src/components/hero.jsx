"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <div className='min-h-screen relative overflow-hidden bg-black pt-10'>
      {/* Background Gradients */}
      <div className='absolute inset-0' />

      {/* Glowing effect that extends behind the navbar */}
      <div className='absolute top-0 left-0 right-0 h-[150vh] pointer-events-none hidden md:block'>
        <div className='absolute top-1/3 right-0 transform -translate-x-1/2 -translate-y-1/2'>
          <div className='w-[340px] h-[420px] rounded-full bg-orange blur-[300px] opacity-80' />
        </div>
      </div>

      <div className='container max-w-[1400px] mx-auto px-4 min-h-screen relative'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-screen'>
          {/* Left Content */}
          <div className='z-10 pt-32'>
            {" "}
            {/* Increased padding-top to account for fixed navbar */}
            {/* Discount Badge */}
            <div className='max-w-72 w-full bg-gradient-to-r from-[rgba(255,255,255,0.2)] to-[#67676733] px-6 py-2.5 rounded-md mb-8'>
              <span className='text-white font-inter text-base'>
                20% <span className='text-white/50'>Discount for</span> 1
                Purchase
              </span>
            </div>
            {/* Main Heading */}
            <div className='relative'>
              <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-snug mb-4 md:mb-8 font-manrope'>
                THE NEXT
                <br />
                <span className='bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
                  GENERATION
                </span>
                <br />
                ACCOUNTS SHOP.
              </h1>

              {/* Circular Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='absolute -top-5 right-0 group w-36 h-36 rounded-full hidden sm:block'
              >
                <div className='absolute inset-0 rounded-full bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart p-[2px]'>
                  <div className='flex items-center justify-center h-full w-full rounded-full bg-black transition-colors group-hover:bg-yellow/10'>
                    <div className='text-center bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent group-hover:bg-none group-hover:text-white'>
                      <span className='block font-medium'>EXPLORE</span>
                      <span className='block font-medium'>PRODUCTS</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
            {/* Description */}
            <p className='text-white/50 text-base max-w-xl mb-12 leading-relaxed'>
              We have selected for you the best banks and crypto exchanges that
              are perfect for your activities. We are constantly updating our
              assortment so that you can use the most relevant accounts on the
              market.
            </p>
          </div>

          {/* Right Image */}
          <div className='relative h-full flex items-center justify-center'>
            {/* Image */}
            <Image
              src='/hand.png'
              alt='3D illustration of floating cards and robotic hand'
              width={640}
              height={700}
              className='object-contain z-10 -mr-10'
              priority
            />
            <div className='absolute  left-0 right-0 h-[120px] pointer-events-none sm:hidden'>
              <div className='absolute t right-0 transform translate-x-1/2 -translate-y-[60%] w-full'>
                <div className='w-[340px] h-[420px] rounded-full bg-orange blur-[300px] opacity-80' />
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='relative bottom-0 right-0 group w-36 h-36 rounded-full mx-auto mb-4 sm:hidden'
          >
            <div className='absolute inset-0 rounded-full bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart p-[2px]'>
              <div className='flex items-center justify-center h-full w-full rounded-full bg-black transition-colors group-hover:bg-yellow/10'>
                <div className='text-center bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent group-hover:bg-none group-hover:text-white'>
                  <span className='block font-medium'>EXPLORE</span>
                  <span className='block font-medium'>PRODUCTS</span>
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
