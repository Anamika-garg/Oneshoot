"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { client } from "@/lib/sanity";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

async function fetchOrders(userId) {
  const { data: ordersData, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Error fetching orders: " + error.message);
  }

  return ordersData;
}

async function fetchProductDetails(order) {
  const productQuery = `
    *[_type == "product" && _id == $productId][0]{
      name,
      "variant": *[_type == "productVariant" && _id == $variantId][0]{
        name,
        downloadFilePath
      }
    }
  `;
  const productData = await client.fetch(productQuery, {
    productId: order.product_id,
    variantId: order.variant_id,
  });

  return {
    productName: productData?.name || "Unknown Product",
    variantName: productData?.variant?.name || "Unknown Variant",
    downloadFilePath: productData?.variant?.downloadFilePath || "",
  };
}

const LatestOrders = ({ userId }) => {
  const router = useRouter();
  const searchParams = useSearchParams()

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", userId],
    queryFn: async () => {
      const allOrders = await fetchOrders(userId);
      const latestOrders = allOrders.slice(0, 2);

      return Promise.all(
        latestOrders.map(async (order) => {
          const details = await fetchProductDetails(order);
          return { ...order, ...details };
        })
      );
    },
    staleTime: 1000 * 60,
  });

  const handleViewAllOrders = () => {
    // Fix: Update the URL and trigger tab change
    router.push("/account?tab=orders");
    // Optional: You might want to trigger any parent component callbacks here
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='text-red-500'
      >
        Error loading orders.
      </motion.div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Card className='bg-lightBlack border-none'>
      <CardContent className='p-6'>
        <AnimatePresence>
          {orders && orders.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='text-gray-400'
            >
              You have no completed orders yet.
            </motion.p>
          ) : (
            <motion.div
              variants={container}
              initial='hidden'
              animate='show'
              className='space-y-4'
            >
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  variants={item}
                  layout
                  className='bg-[#1c1c1c] p-4 rounded-lg'
                >
                  <motion.h3
                    variants={item}
                    className='text-lg font-medium text-white mb-2'
                  >
                    {order.productName} – {order.variantName}
                  </motion.h3>
                  <motion.p
                    variants={item}
                    className='text-sm text-gray-400 mb-2'
                  >
                    Order Date:{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </motion.p>
                  <motion.p
                    variants={item}
                    className='text-sm text-gray-400 mb-2'
                  >
                    Amount: ${order.amount.toFixed(2)}
                  </motion.p>
                  {order.downloadFilePath && (
                    <Link href={order.downloadFilePath}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className='bg-orange text-black hover:bg-yellow focus:ring-none focus:outline-none'
                          tabIndex={0}
                          aria-label={`Download ${order.productName}`}
                        >
                          Download
                        </Button>
                      </motion.div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='mt-4'
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className='bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent font-semibold text-lg hover:opacity-80 transition-opacity'
              onClick={handleViewAllOrders}
            >
              View All Orders
            </Button>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default LatestOrders;
