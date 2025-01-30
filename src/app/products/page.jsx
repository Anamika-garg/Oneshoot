"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/sanity";
import { ProductModal } from "@/components/products/ProductsModal";

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <section className='py-20 bg-black min-h-screen'>
      <div className='container px-4 mx-auto pt-12'>
        <div className='text-center mb-12'>
          <h2 className='text-xl font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent mb-2'>
            ALL PRODUCTS
          </h2>
          <p className='text-4xl font-bold text-white tracking-wider'>
            FULL COLLECTION
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {products.map((product) => (
            <div
              key={product._id}
              role='button'
              tabIndex={0}
              onClick={() => handleProductClick(product)}
              onKeyDown={(e) =>
                e.key === "Enter" || e.key === " "
                  ? handleProductClick(product)
                  : null
              }
              className='relative rounded-xl bg-[#0E0E0E] overflow-hidden group font-manrope cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange transition-all'
            >
              <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-gradientStart via-gradientMid to-gradientStart opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

              <div className='relative z-10 p-[1px] rounded-xl'>
                <div className='bg-[#0E0E0E] rounded-xl p-3'>
                  <div className='absolute top-0 left-1/2 transform -translate-x-1/2 z-10'>
                    <div className='bg-orange text-black font-bold text-sm px-4 py-1'>
                      from {product.basePrice}$
                    </div>
                  </div>

                  <div className='relative overflow-hidden'>
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className='w-full h-full object-cover border border-orange'
                      aria-label={product.name}
                    />
                    <div className='absolute inset-0 overflow-hidden'>
                      <div className='absolute -left-full top-full w-[200%] h-[3px] bg-gradient-to-r from-[#FFDD55] via-[#CF7B17] to-[#FFDD55] rotate-45 group-hover:translate-x-full group-hover:-translate-y-full transition-all duration-700 ease-out' />
                    </div>
                  </div>

                  <div className='mt-4 space-y-4'>
                    <h4 className='text-2xl text-white uppercase font-extrabold'>
                      {product.name}
                    </h4>
                    <div className='flex items-end justify-between'>
                      <div className='space-y-2'>
                        <p className='text-orange'>Category:</p>
                        <p className='text-white text-sm'>{product.category}</p>
                      </div>
                      <Button
                        className='bg-orange hover:bg-orange/70 text-black font-semibold text-sm py-1.5 px-3'
                        aria-label={`Buy ${product.name}`}
                      >
                        Buy Now <ShoppingCart className='ml-2 h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={handleCloseModal} />
        )}
      </div>
    </section>
  );
}
