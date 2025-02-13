"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView, useAnimation } from "framer-motion";
import { getCategories, getProducts } from "@/lib/sanity";
import { ProductModal } from "./products/ProductsModal";
import { ProductCard } from "./products/ProductCard";

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const controls = useAnimation();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

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
    controls.set("hidden");
    setTimeout(() => {
      controls.start("visible");
    }, 50);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className='py-20 bg-black min-h-screen'
    >
      <div className='container px-4 mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className='text-center mb-12'
        >
          <h2 className='text-xl font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent mb-2'>
            OUR OFFERS
          </h2>
          <p className='text-4xl font-bold text-white tracking-wider'>
            EXPLORE PRODUCTS
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
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
        <motion.div
          key={selectedCategory}
          variants={containerVariants}
          initial='hidden'
          animate={controls}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
        >
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={handleProductClick}
              index={index}
              total={filteredProducts.length}
            />
          ))}
        </motion.div>

        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={handleCloseModal} />
        )}
      </div>
    </motion.section>
  );
}
