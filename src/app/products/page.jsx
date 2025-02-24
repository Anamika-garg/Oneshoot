"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getCategories, getProducts } from "@/lib/sanity";
import { ProductModal } from "@/components/products/ProductsModal";
import { ProductCard } from "@/components/products/ProductCard";
import { Pagination } from "@/components/products/Pagination";
import { useProductContext } from "../context/ProductContext";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const { selectedCategory, setSelectedCategory } = useProductContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () => getProducts(selectedCategory),
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const indexOfLastProduct = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - ITEMS_PER_PAGE;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const getCategoryClass = (categoryName) =>
    `px-4 py-2 text-lg md:text-xl relative transition-all duration-300 bg-transparent hover:bg-transparent ${
      selectedCategory === categoryName
        ? "text-transparent bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text"
        : "text-gray-400 hover:text-white"
    }`;

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
    <section className='py-20 bg-black min-h-screen'>
      <div className='container px-4 mx-auto pt-12'>
        <div className='text-center mb-12'>
          <h2 className='text-xl font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent mb-2'>
            ALL PRODUCTS
          </h2>
          <p className='text-5xl font-bold text-white tracking-wider'>
            FULL COLLECTION
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='flex flex-wrap justify-center gap-4 mb-12 max-w-4xl mx-auto'
        >
          <Button
            key='All'
            onClick={() => handleCategoryClick("All")}
            className={getCategoryClass("All")}
            aria-label='Show all categories'
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id}
              onClick={() => handleCategoryClick(category.name)}
              className={getCategoryClass(category.name)}
              aria-label={`Filter by ${category.name} category`}
            >
              {category.name}
            </Button>
          ))}
        </motion.div>

        <motion.div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          {currentProducts.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={handleProductClick}
              index={index}
            />
          ))}
        </motion.div>

        {filteredProducts.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        )}

        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={handleCloseModal} />
        )}
      </div>
    </section>
  );
}
