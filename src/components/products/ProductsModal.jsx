"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getProductsByName, getCategories } from "@/lib/sanity";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function ProductModal({ product, onClose }) {
  const [isOpen, setIsOpen] = useState(true);

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["productsByName", product.name],
    queryFn: () => getProductsByName(product.name),
  });

  const allProducts = productsData?.products || [];

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const categoryImageMap =
    categoriesData?.reduce((acc, cat) => {
      acc[cat.name] = cat.image;
      return acc;
    }, {}) || {};

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const isLoading = isProductsLoading || isCategoriesLoading;

  const allVariants = allProducts.flatMap((prod) =>
    prod.variants?.length
      ? prod.variants.map((variant) => ({
          ...variant,
          category: prod.category,
          productSlug: prod.slug,
          categoryImage: categoryImageMap[prod.category],
        }))
      : [
          {
            _id: prod._id,
            name: prod.name,
            slug: prod.slug,
            price: prod.basePrice,
            category: prod.category,
            productSlug: prod.slug,
            categoryImage: categoryImageMap[prod.category],
          },
        ]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key='modal'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <DialogContent className='bg-black text-white rounded-xl p-6 max-w-5xl w-full border-2 border-orange'>
              <DialogHeader>
                <DialogTitle className='text-xl md:text-2xl font-bold text-center'>
                  All "{product.name}" products
                </DialogTitle>
              </DialogHeader>

              {isLoading ? (
                <div className='flex justify-center items-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange'></div>
                </div>
              ) : categoriesError ? (
                <p className='text-center text-red-500'>
                  Error loading category data.
                </p>
              ) : allVariants.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4'>
                  {allVariants.map((variant) => (
                    <Link
                      href={`/products/${variant.productSlug}/${variant.slug}`}
                      key={variant._id}
                      className='flex flex-col p-4 bg-[#0E0E0E] rounded-lg border-2 border-transparent hover:bg-black/80 hover:border-orange transition-colors duration-200'
                      aria-label={`View details of ${variant.name}`}
                    >
                      {variant.categoryImage ? (
                        <Image
                          src={variant.categoryImage || "/placeholder.svg"}
                          alt={`${variant.category} image`}
                          width={150}
                          height={150}
                          className='rounded-md w-full h-auto object-cover'
                        />
                      ) : (
                        <div className='w-full h-32 bg-gray-700 rounded-md'></div>
                      )}
                      <div className='mt-3 text-left'>
                        <h3 className='text-lg text-white'>{variant.name}</h3>
                        <p className='text-sm text-gray-400 mt-1'>
                          ${variant.price}
                        </p>
                        <p className='text-xs text-orange font-medium mt-1'>
                          {variant.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className='text-white text-center py-4'>
                  No products found with this name.
                </p>
              )}

              <div className='mt-4 flex justify-center'>
                <Button
                  onClick={handleClose}
                  className='bg-orange text-black rounded hover:bg-orange/70 px-6 py-2'
                  aria-label='Close dialog'
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
