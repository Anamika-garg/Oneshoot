"use client";
import { useState } from "react";
import { hover, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCategories, getProducts } from "@/lib/sanity";
import { useProductContext } from "@/app/context/ProductContext";
import { FadeInWhenVisible } from "./ui/FadeInWhenVisible";
import { ProductCard } from "./products/ProductCard";
import { Button } from "./ui/button";

export function ProductGrid() {
  const { selectedCategory, setSelectedCategory } = useProductContext();
  const [hoverCategory, setHoverCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const router = useRouter();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () => getProducts(selectedCategory),
  });

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const displayedProducts = filteredProducts.slice(0, 8);
  const activeCategoryforUnderline = hoverCategory || selectedCategory;

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

  const handleLoadMore = () => {
    router.push("/products");
  };

  return (
    <section className='py-20 bg-black min-h-screen overflow-x-clip'>
      <div className='container px-4 mx-auto'>
        {/* Title Section */}
        <FadeInWhenVisible>
          <h2 className='text-xl font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent mb-2 text-center'>
            OUR OFFERS
          </h2>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.1}>
          <p className='text-4xl font-bold text-white tracking-wider text-center mb-12'>
            EXPLORE PRODUCTS
          </p>
        </FadeInWhenVisible>

        {/* Categories */}
        <FadeInWhenVisible delay={0.2}>
          <div className='flex flex-wrap justify-center gap-4 mb-12 max-w-4xl mx-auto'>
            {["All", ...categories.map((c) => c.name)].map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={getCategoryClass(category)}
                onMouseEnter={() => setHoverCategory(category)}
                onMouseLeave={() => setHoverCategory(null)}
              >
                <div className={`relative py-2 ${getCategoryClass(category)} `}>
                  {category}
                  {selectedCategory === category && (
                    <motion.div
                      layoutId='active'
                      className='absolute bottom-0 left-0 right-0 w-full h-0.5  bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart'
                    />
                  )}
                  {activeCategoryforUnderline === category && (
                    <motion.div
                      layoutId='hover'
                      className='absolute bottom-0 left-0 right-0 w-full h-0.5 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart'
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </FadeInWhenVisible>

        {/* Products Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {displayedProducts.map((product, index) => (
            <FadeInWhenVisible key={product._id} delay={0.1 * index}>
              <ProductCard product={product} onClick={handleProductClick} />
            </FadeInWhenVisible>
          ))}
        </div>

        {/* Load More Button */}
        {filteredProducts.length > 8 && (
          <FadeInWhenVisible delay={0.3}>
            <div className='text-center mt-8'>
              <Button
                onClick={handleLoadMore}
                className='px-6 py-3 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart text-black rounded-md font-semibold hover:opacity-70 transition-opacity'
              >
                Load More
              </Button>
            </div>
          </FadeInWhenVisible>
        )}

        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={handleCloseModal} />
        )}
      </div>
    </section>
  );
}
