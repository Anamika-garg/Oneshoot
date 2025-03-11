"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getProducts } from "@/lib/sanity";
import { ProductModal } from "@/components/products/ProductsModal";
import { ProductCard } from "@/components/products/ProductCard";
import { Pagination } from "@/components/products/Pagination";
import { useProductContext } from "../context/ProductContext";
import { Button } from "@/components/ui/button";
import { FadeInWhenVisible } from "@/components/ui/FadeInWhenVisible";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const { selectedCategory, setSelectedCategory } = useProductContext();
  const [hoverCategory, setHoverCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();

  // More reliable scroll to top implementation
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto", // Using "auto" is more reliable than "instant"
    });
  }, []);

  // Effect to scroll to top when page or category changes
  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]); // Only scrollToTop needs to be in the dependency array

  // Effect to handle URL params if needed
  useEffect(() => {
    const page = searchParams.get("page");
    if (page) {
      setCurrentPage(Number(page));
    }
  }, [searchParams]);

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
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handleCategoryClick = useCallback(
    (category) => {
      setSelectedCategory(category);
      setCurrentPage(1);
      // No need to call scrollToTop here as the effect will handle it
    },
    [setSelectedCategory]
  );

  const handlePageChange = useCallback(
    (page) => {
      if (page === currentPage) return;
      setCurrentPage(page);
      // No need to call scrollToTop here as the effect will handle it
    },
    [currentPage]
  );

  const getCategoryClass = (categoryName) =>
    `px-4 py-2 text-lg md:text-xl relative transition-all duration-300 bg-transparent ${
      selectedCategory === categoryName
        ? "text-transparent bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text"
        : "text-gray-400 hover:text-white"
    }`;

  const activeCategoryForUnderline = hoverCategory || selectedCategory;

  return (
    <section className='py-24 bg-black min-h-screen'>
      <div className='container px-4 mx-auto pt-12'>
        <FadeInWhenVisible>
          <div className='text-center mb-12'>
            <h2 className='text-xl font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent mb-2'>
              ALL PRODUCTS
            </h2>
            <p className='text-5xl font-bold text-white tracking-wider'>
              FULL COLLECTION
            </p>
          </div>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.2}>
          <div className='flex flex-wrap justify-center gap-4 mb-12 max-w-4xl mx-auto'>
            <Button
              key='All'
              onClick={() => handleCategoryClick("All")}
              className={`${getCategoryClass("All")} bg-transparent`}
              onMouseEnter={() => setHoverCategory("All")}
              onMouseLeave={() => setHoverCategory(null)}
              aria-label='Show all categories'
            >
              <div
                className={`relative ${
                  selectedCategory === "All"
                    ? "text-transparent bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text"
                    : "text-gray-400 hover:text-white"
                } `}
              >
                All
                {selectedCategory === "All" && (
                  <motion.div
                    layoutId='active'
                    className='absolute bottom-0 left-0 right-0 w-full h-0.5 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart'
                  />
                )}
                {activeCategoryForUnderline === "All" && (
                  <motion.div
                    layoutId='hover'
                    className='absolute bottom-0 left-0 right-0 w-full h-0.5 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart'
                  />
                )}
              </div>
            </Button>
            {categories.map((category) => (
              <Button
                key={category._id}
                onClick={() => handleCategoryClick(category.name)}
                className={`${getCategoryClass(category.name)} bg-transparent hover:bg-transparent`}
                onMouseEnter={() => setHoverCategory(category.name)}
                onMouseLeave={() => setHoverCategory(null)}
                aria-label={`Filter by ${category.name} category`}
              >
                <div className={`relative ${getCategoryClass(category.name)} `}>
                  {category.name}
                  {selectedCategory === category.name && (
                    <motion.div
                      layoutId='active'
                      className='absolute bottom-0 left-0 right-0 w-full h-0.5 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart'
                    />
                  )}
                  {activeCategoryForUnderline === category.name && (
                    <motion.div
                      layoutId='hover'
                      className='absolute bottom-0 left-0 right-0 w-full h-0.5 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart'
                    />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </FadeInWhenVisible>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {currentProducts.map((product, index) => (
            <FadeInWhenVisible key={product._id} delay={0.3 + index * 0.1}>
              <ProductCard
                product={product}
                onClick={handleProductClick}
                index={index}
              />
            </FadeInWhenVisible>
          ))}
        </div>

        {filteredProducts.length > ITEMS_PER_PAGE && (
          <FadeInWhenVisible delay={0.4}>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)}
              onPageChange={handlePageChange}
            />
          </FadeInWhenVisible>
        )}

        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={handleCloseModal} />
        )}
      </div>
    </section>
  );
}
