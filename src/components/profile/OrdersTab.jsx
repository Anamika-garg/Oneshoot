"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/sanity";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Loader from "../ui/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInWhenVisible } from "../ui/FadeInWhenVisible";

const supabase = createClient();

const OrdersTab = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: ordersData, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "paid");

        if (error) throw error;

        if (ordersData.length === 0) {
          setOrders([]);
          return;
        }

        const ordersWithDetails = await Promise.all(
          ordersData.map(async (order) => {
            const productQuery = `*[_type == "product" && _id == $productId][0]{
              name,
              "variant": *[_type == "productVariant" && _id == $variantId][0]{
                name,
                downloadFilePath
              }
            }`;
            const productData = await client.fetch(productQuery, {
              productId: order.product_id,
              variantId: order.variant_id,
            });

            return {
              ...order,
              productName: productData?.name || "Unknown Product",
              variantName: productData?.variant?.name || "Unknown Variant",
              downloadFilePath: productData?.variant?.downloadFilePath || "",
            };
          })
        );

        setOrders(ordersWithDetails);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.id]);

  if (loading) {
    return <Loader />;
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
    <FadeInWhenVisible>
      <Card className='bg-lightBlack border-none mt-10'>
        <CardContent className='p-6'>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className='text-2xl font-semibold mb-4 text-white'
          >
            Order History
          </motion.h2>
          <AnimatePresence>
            {orders.length === 0 ? (
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
                      {order.productName} - {order.variantName}
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
                      <Link href={order.downloadFilePath} className='w-full'>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className='bg-orange text-black hover:bg-yellow-400 focus:ring-none focus:outline-none'
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
        </CardContent>
      </Card>
    </FadeInWhenVisible>
  );
};

export default OrdersTab;
