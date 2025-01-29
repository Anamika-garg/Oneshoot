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
import { getProductVariants, getCategories } from "@/lib/sanity";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function ProductModal({ product, onClose }) {
  const [isOpen, setIsOpen] = useState(true); // Local state for closing animation

  // Fetch product variants
  const { data: variantsData } = useQuery({
    queryKey: ["productVariants", product._id],
    queryFn: () => getProductVariants(product._id),
  });

  const variants = variantsData?.variants || [];

  // Fetch categories to get the category image
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Find the category object that matches the product's category name
  const category = categoriesData?.find((cat) => cat.name === product.category);
  const categoryImageUrl = category?.image;

  const handleClose = () => {
    setIsOpen(false); // Trigger exit animation
    setTimeout(onClose, 300); // Ensure modal fully closes before unmounting
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <DialogContent className='bg-black text-white rounded-xl p-6 max-w-3xl w-full border-2 border-orange'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-bold'>
                  Product Options for {product.name}
                </DialogTitle>
              </DialogHeader>

              {isCategoriesLoading ? (
                <p className='text-center'>Loading...</p>
              ) : categoriesError ? (
                <p className='text-center text-red-500'>Error loading category image.</p>
              ) : variants.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                  {variants.map((variant) => (
                    <Link
                      href={`/products/${product.slug}/${variant.slug}`}
                      key={variant._id}
                      className='flex flex-col max-w-xs items-start p-4 bg-[#0E0E0E] rounded-lg border-2 border-transparent hover:bg-black/80 hover:border-orange transition-colors duration-200'
                      aria-label={`View details of ${variant.name}`}
                    >
                      {categoryImageUrl ? (
                        <Image
                          src={categoryImageUrl}
                          alt={`${category.name} image`}
                          width={150}
                          height={150}
                          className='rounded-md w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-12 h-12 bg-gray-700 rounded-md'></div>
                      )}
                      <div className='ml-2 mt-2 text-left'>
                        <h3 className='text-lg text-white'>{variant.name}</h3>
                        <p className='text-sm text-gray-400 mt-1'>${variant.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className='text-white text-center'>No variants available.</p>
              )}

              <div className='mt-4'>
                <Button
                  onClick={handleClose}
                  className='w-full bg-orange text-black rounded hover:bg-orange/70'
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