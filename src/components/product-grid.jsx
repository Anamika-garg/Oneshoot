"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/sanity";
import { ProductModal } from "./products/ProductsModal";

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const getCategoryClass = (categoryName) =>
    `px-4 py-2 text-lg md:text-xl relative transition-all duration-300 ${
      selectedCategory === categoryName
        ? "text-transparent bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text"
        : "text-gray-400 hover:text-white"
    }`;

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
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
          <button
            key='All'
            onClick={() => handleCategoryClick("All")}
            className={getCategoryClass("All")}
            aria-label='Show all categories'
          >
            All
            <span
              className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart transition-all duration-300 ${
                selectedCategory === "All" ? "w-full" : "w-0"
              }`}
            />
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category.name)}
              className={getCategoryClass(category.name)}
              aria-label={`Filter by ${category.name} category`}
            >
              {category.name}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart transition-all duration-300 ${
                  selectedCategory === category.name ? "w-full" : "w-0"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className='relative rounded-xl bg-[#0E0E0E] overflow-hidden group font-manrope cursor-pointer'
              onClick={() => handleProductClick(product)}
            >
              {/* Gradient border */}
              <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-gradientStart via-gradientMid to-gradientStart opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

              {/* Card content */}
              <div className='relative z-10 p-[1px] rounded-xl'>
                <div className='bg-[#0E0E0E] rounded-xl p-3'>
                  {/* Price Tag */}
                  <div className='absolute top-0 left-1/2 transform -translate-x-1/2 z-10'>
                    <div className='bg-orange text-black font-bold text-sm px-4 py-1'>
                      from {product.basePrice}$
                    </div>
                  </div>

                  {/* Product Image and Name */}
                  <div className='relative overflow-hidden '>
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
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
                      {product.name}
                    </h4>
                    <div className='flex items-end justify-between'>
                      <div className='space-y-2'>
                        <p className='text-orange'>Category:</p>
                        <p className='text-white text-sm'>{product.category}</p>
                      </div>
                      <Button className='bg-orange hover:bg-orange/70 text-black font-semibold text-sm py-1.5 px-3'>
                        Buy Now <ShoppingBasket className='ml-2 h-4 w-4' />
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
