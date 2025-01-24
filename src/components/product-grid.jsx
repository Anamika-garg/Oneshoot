"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const categories = [
  "All",
  "NEOBANKS",
  "CryptoExchanges",
  "Spanish Banks",
  "British Accounts",
  "Italian Banks",
  "Business Accounts",
  "USA BANKS",
  "CryptoAccounts",
];

const products = [
  {
    id: "1",
    category: "NEOBANKS",
    price: 95,
    image: "/card-img.png",
    description: "LT IBAN, 2VCC Mastercard",
  },
  {
    id: "2",
    category: "Spanish Banks",
    price: 250,
    image: "/card-img.png",
    description: "LT IBAN, 2VCC Mastercard",
  },
  {
    id: "3",
    category: "CryptoExchanges",
    price: 90,
    image: "/card-img.png",
    description: "LT IBAN, 2VCC Mastercard",
  },
  {
    id: "4",
    category: "Italian Banks",
    price: 475,
    image: "/card-img.png",
    description: "LT IBAN, 2VCC Mastercard",
  },
  {
    id: "5",
    category: "British Accounts",
    price: 300,
    image: "/card-img.png",
    description: "LT IBAN, 2VCC Mastercard",
  },
  {
    id: "6",
    category: "Business Accounts",
    price: 350,
    image: "/card-img.png",
    description: "LT IBAN, 2VCC Mastercard",
  },
  {
    id: "7",
    category: "USA BANKS",
    price: 0,
    image: "/card-img.png",
    description: "LT IBAN, 2VCC Mastercard",
  },
  {
    id: "8",
    category: "CryptoAccounts",
    price: 0,
    image: "/card-img.png",
    description: "LT IBAN, 2VCC Mastercard",
  },
];

export function ProductGrid() {
  const [visibleProducts, setVisibleProducts] = useState(products);
  const [isMobile, setIsMobile] = useState(false);

  // Determine screen size and set visible products accordingly
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Tailwind's md breakpoint is 768px
        setIsMobile(true);
        setVisibleProducts(products.slice(0, 3));
      } else {
        setIsMobile(false);
        setVisibleProducts(products);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handler for "More" button
  const handleShowMore = () => {
    setVisibleProducts(products);
  };

  return (
    <section className='py-20 bg-black min-h-screen'>
      <div className='container px-4 mx-auto'>
        <div className='text-center mb-12'>
          <h2 className='text-xl font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent mb-2'>
            OUR OFFERS
          </h2>
          <p className='text-4xl font-bold text-white tracking-wider'>
            EXPLORE PRODUCTS
          </p>
        </div>

        {/* Categories */}
        <div className='flex flex-wrap justify-center gap-4 mb-12 max-w-4xl mx-auto'>
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 text-lg md:text-xl transition-colors ${
                category === "All"
                  ? "bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent underline underline-offset-4"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className='relative rounded-xl bg-[#0E0E0E] overflow-hidden group font-manrope'
            >
              {/* Gradient border */}
              <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-gradientStart via-gradientMid to-gradientStart opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

              {/* Card content */}
              <div className='relative z-10 p-[1px] rounded-xl'>
                <div className='bg-[#0E0E0E] rounded-xl p-3'>
                  {/* Price Tag */}
                  <div className='absolute top-0 left-1/2 transform -translate-x-1/2 z-10'>
                    <div className='bg-orange text-black font-bold text-sm px-4 py-1'>
                      from {product.price}$
                    </div>
                  </div>

                  {/* Product Image and Name */}
                  <div className='relative overflow-hidden '>
                    <img
                      src={product.image}
                      alt={product.category}
                      className='w-full h-full object-cover border border-orange '
                    />
                    {/* Diagonal line animation */}
                    <div className='absolute inset-0 overflow-hidden'>
                      <div className='absolute -left-full top-full w-[200%] h-[3px] bg-gradient-to-r from-[#FFDD55] via-[#CF7B17] to-[#FFDD55] rotate-45 group-hover:translate-x-full group-hover:-translate-y-full transition-all duration-700 ease-out' />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className='mt-4 space-y-4'>
                    <h4 className='text-2xl text-white uppercase font-extrabold'>
                      {product.category}
                    </h4>
                    <div className='flex items-end justify-between'>
                      <div className='space-y-2'>
                        <p className='text-orange'>Description:</p>
                        <p className='text-white text-sm'>
                          {product.description}
                        </p>
                      </div>
                      <Button className='bg-orange hover:bg-orange/70 text-black font-semibold text-sm py-1.5 px-3'>
                        Buy Now{" "}
                        <Image
                          src='/cart.svg'
                          width={20}
                          height={20}
                          alt='cart icon'
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* "More" Button for Mobile */}
        {isMobile && visibleProducts.length < products.length && (
          <div className='flex justify-center mt-8'>
            <Button
              onClick={handleShowMore}
              className='bg-transparent hover:bg-orange/70 text-white font-semibold px-6 py-2 border-orange border-[1px]'
            >
              more
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
