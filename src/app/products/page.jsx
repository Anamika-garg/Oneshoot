"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getProducts } from "@/lib/sanity";
import { ProductModal } from "@/components/products/ProductsModal";
import { ProductCard } from "@/components/products/ProductCard";
import { Pagination } from "@/components/products/Pagination";

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const indexOfLastProduct = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - ITEMS_PER_PAGE;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

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

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(products.length / ITEMS_PER_PAGE)}
          onPageChange={setCurrentPage}
        />

        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={handleCloseModal} />
        )}
      </div>
    </section>
  );
}
