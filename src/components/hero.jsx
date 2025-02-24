"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const staggerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className='min-h-screen relative overflow-x-clip bg-black pt-10'
    >
      {/* Background Gradients */}
      <div className='absolute inset-0' />

      {/* Glowing effect that extends behind the navbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className='absolute top-0 left-0 right-0 h-[150vh] pointer-events-none hidden md:block'
      >
        <div className='absolute top-1/3 right-0 transform -translate-x-1/2 -translate-y-1/2'>
          <div className='w-[340px] h-[420px] rounded-full bg-orange blur-[300px] opacity-80' />
        </div>
      </motion.div>

      <div className='container max-w-[1400px] mx-auto px-4 min-h-screen relative'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-screen'>
          {/* Left Content */}
          <div className='z-10 pt-32'>
            {/* Discount Badge */}
            <motion.div
              variants={staggerVariants}
              initial='hidden'
              animate={isInView ? "visible" : "hidden"}
              custom={0}
              className='max-w-80 w-full bg-gradient-to-r from-[rgba(255,255,255,0.2)] to-[#67676733] px-6 py-2.5 rounded-md mb-8'
            >
              <span className='text-white font-inter text-base flex items-center gap-2'>
                <svg
                  width='27'
                  height='27'
                  viewBox='0 0 27 27'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    opacity='0.4'
                    d='M13.4412 26.8176C12.4159 26.8176 11.3919 26.4283 10.6092 25.6509L9.63589 24.6776C9.25849 24.3016 8.75319 24.0936 8.21719 24.0923H6.84785C4.63451 24.0923 2.83318 22.2909 2.83318 20.0776V18.7069C2.83185 18.1723 2.62385 17.6669 2.24651 17.2869L1.28918 16.3309C-0.278818 14.7723 -0.285488 12.2243 1.27451 10.6549L2.24785 9.68033C2.62385 9.30293 2.83185 8.79763 2.83318 8.26163V6.89362C2.83318 4.67895 4.63451 2.87762 6.84785 2.87762H8.21849C8.75319 2.87762 9.25719 2.66962 9.63719 2.28962L10.5959 1.33362C12.1545 -0.23438 14.7012 -0.24238 16.2719 1.31895L17.2452 2.29228C17.6239 2.66962 18.1279 2.87762 18.6625 2.87762H20.0332C22.2465 2.87762 24.0479 4.67895 24.0479 6.89362V8.26293C24.0492 8.79763 24.2572 9.30293 24.6345 9.68293L25.5919 10.6403C26.3505 11.3949 26.7705 12.4003 26.7745 13.4736C26.7772 14.5403 26.3665 15.5443 25.6185 16.3029C25.6052 16.3163 25.5932 16.3309 25.5799 16.3429L24.6332 17.2896C24.2572 17.6669 24.0492 18.1723 24.0479 18.7083V20.0776C24.0479 22.2909 22.2465 24.0923 20.0332 24.0923H18.6625C18.1279 24.0936 17.6225 24.3016 17.2439 24.6789L16.2852 25.6363C15.5039 26.4229 14.4719 26.8176 13.4412 26.8176Z'
                    fill='#181818'
                  />
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M10.8328 10.8878C10.6128 11.1078 10.3275 11.2265 10.0115 11.2265C9.71549 11.2265 9.42479 11.1052 9.19149 10.8865C8.97009 10.6665 8.84479 10.3652 8.84479 10.0598C8.84479 9.76923 8.96749 9.47053 9.18349 9.23983C9.30209 9.11983 9.44349 9.02923 9.58479 8.98123C9.98749 8.79723 10.5221 8.90523 10.8395 9.23853C10.9528 9.35183 11.0395 9.47583 11.0968 9.60523C11.1595 9.74383 11.1915 9.90123 11.1915 10.0598C11.1915 10.3772 11.0648 10.6718 10.8328 10.8878ZM17.6964 9.23303C17.2417 8.77973 16.5017 8.77973 16.0471 9.23303L9.19369 16.0864C8.73909 16.541 8.73909 17.281 9.19369 17.737C9.41509 17.957 9.70709 18.0784 10.0191 18.0784C10.3311 18.0784 10.6231 17.957 10.8431 17.737L17.6964 10.8837C18.1511 10.4277 18.1511 9.68903 17.6964 9.23303ZM17.3168 15.8385C16.8848 15.6572 16.3728 15.7558 16.0315 16.0972C15.9608 16.1798 15.8608 16.3078 15.7928 16.4585C15.7208 16.6212 15.7115 16.7958 15.7115 16.9132C15.7115 17.0305 15.7208 17.2038 15.7928 17.3665C15.8595 17.5158 15.9395 17.6372 16.0448 17.7425C16.2861 17.9665 16.5661 18.0798 16.8781 18.0798C17.1741 18.0798 17.4648 17.9598 17.7035 17.7372C17.9155 17.5252 18.0315 17.2318 18.0315 16.9132C18.0315 16.5932 17.9155 16.3012 17.7021 16.0878C17.5848 15.9718 17.4435 15.8812 17.3168 15.8385Z'
                    fill='#FFB528'
                  />
                </svg>
                20{" "}
                <span className='text-white/50 flex-1 w-full'>
                  Discount for
                </span>{" "}
                1<span className='flex-1'>Purchase</span>
              </span>
            </motion.div>
            {/* Main Heading */}
            <div className='relative'>
              <motion.h1
                variants={staggerVariants}
                initial='hidden'
                animate={isInView ? "visible" : "hidden"}
                custom={1}
                className='text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-snug mb-4 md:mb-8 font-manrope'
              >
                THE NEXT
                <br />
                <span className='bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
                  GENERATION
                </span>
                <br />
                ACCOUNTS SHOP.
              </motion.h1>

              {/* Circular Button */}
              <motion.button
                variants={staggerVariants}
                initial='hidden'
                animate={isInView ? "visible" : "hidden"}
                custom={2}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='absolute -top-5 right-0 group w-36 h-36 rounded-full hidden sm:block'
              >
                <Link
                  className='absolute inset-0 rounded-full bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart p-[2px]'
                  href='/products'
                >
                  <div className='flex items-center justify-center h-full w-full rounded-full bg-black transition-colors group-hover:bg-yellow/10'>
                    <div className='text-center bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent group-hover:bg-none group-hover:text-white'>
                      <span className='block font-medium'>EXPLORE</span>
                      <span className='block font-medium'>PRODUCTS</span>
                    </div>
                  </div>
                </Link>
              </motion.button>
            </div>
            {/* Description */}
            <motion.p
              variants={staggerVariants}
              initial='hidden'
              animate={isInView ? "visible" : "hidden"}
              custom={3}
              className='text-white/50 text-base max-w-xl mb-12 leading-relaxed'
            >
              We have selected for you the best banks and crypto exchanges that
              are perfect for your activities. We are constantly updating our
              assortment so that you can use the most relevant accounts on the
              market.
            </motion.p>
          </div>

          {/* Right Image */}
          <motion.div
            variants={staggerVariants}
            initial='hidden'
            animate={isInView ? "visible" : "hidden"}
            custom={4}
            className='relative h-full flex items-center justify-center'
          >
            {/* Image */}
            <Image
              src='/hand.png'
              alt='3D illustration of floating cards and robotic hand'
              width={640}
              height={700}
              className='object-contain z-10 -mr-10 -mt-16'
              priority
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 1 }}
              className='absolute left-0 right-0 h-[120px] pointer-events-none sm:hidden'
            >
              <div className='absolute t right-0 transform translate-x-1/2 -translate-y-[60%] w-full'>
                <div className='w-[340px] h-[420px] rounded-full bg-orange blur-[300px] opacity-80' />
              </div>
            </motion.div>
          </motion.div>
          <motion.button
            variants={staggerVariants}
            initial='hidden'
            animate={isInView ? "visible" : "hidden"}
            custom={5}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='relative bottom-0 right-0 group w-36 h-36 rounded-full mx-auto mb-4 sm:hidden'
          >
            <Link
              className='absolute inset-0 rounded-full bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart p-[2px]'
              href='/products'
            >
              <div className='flex items-center justify-center h-full w-full rounded-full bg-black transition-colors group-hover:bg-yellow/10'>
                <div className='text-center bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent group-hover:bg-none group-hover:text-white'>
                  <span className='block font-medium'>EXPLORE</span>
                  <span className='block font-medium'>PRODUCTS</span>
                </div>
              </div>
            </Link>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
