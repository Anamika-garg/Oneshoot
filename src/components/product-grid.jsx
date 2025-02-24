"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCategories, getProducts } from "@/lib/sanity";
import { ProductModal } from "./products/ProductsModal";
import { ProductCard } from "./products/ProductCard";
import AnimatedText from "./ui/AnimatedText";
import { Button } from "./ui/button";
import { useProductContext } from "@/app/context/ProductContext";

export function ProductGrid() {
  const { selectedCategory, setSelectedCategory } = useProductContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const sectionRef = useRef(null);
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
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className='py-20 bg-black min-h-screen'
    >
      <div className='container px-4 mx-auto'>
        <AnimatedText>
          <h2 className='text-xl font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent mb-2 text-center'>
            OUR OFFERS
          </h2>
        </AnimatedText>
        <AnimatedText>
          <p className='text-4xl font-bold text-white tracking-wider text-center mb-12'>
            EXPLORE PRODUCTS
          </p>
        </AnimatedText>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='flex flex-wrap justify-center gap-4 mb-12 max-w-4xl mx-auto'
        >
          <button
            key='All'
            onClick={() => handleCategoryClick("All")}
            className={getCategoryClass("All")}
            aria-label='Show all categories'
          >
            All
            <motion.span
              className='absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart'
              initial={{ width: "0%" }}
              animate={{ width: selectedCategory === "All" ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
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
              <motion.span
                className='absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart'
                initial={{ width: "0%" }}
                animate={{
                  width: selectedCategory === category.name ? "100%" : "0%",
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {displayedProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard
                product={product}
                onClick={handleProductClick}
                index={index}
                total={displayedProducts.length}
              />
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {filteredProducts.length > 8 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='text-center mt-8'
          >
            <Button
              onClick={handleLoadMore}
              className='px-6 py-3 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart text-black rounded-md font-semibold hover:opacity-70 transition-opacity'
            >
              Load More
            </Button>
          </motion.div>
        )}

        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={handleCloseModal} />
        )}
      </div>
    </motion.section>
  );
}
