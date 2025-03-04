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
import { Clock, RefreshCw } from "lucide-react";

const supabase = createClient();

const OrdersTab = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["paid", "pending"]) // Include pending orders
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Group orders by timestamp (within 5 seconds to account for slight delays)
      const groupedOrders = {};

      ordersData.forEach((order) => {
        // Find if there's an existing group within 5 seconds
        const orderTime = new Date(order.created_at).getTime();

        // Look for an existing group that's within 5 seconds
        let foundGroup = false;
        for (const timeKey in groupedOrders) {
          const groupTime = new Date(timeKey).getTime();
          if (Math.abs(orderTime - groupTime) < 5000) {
            // 5 seconds
            groupedOrders[timeKey].items.push(order);
            foundGroup = true;
            break;
          }
        }

        // If no matching group found, create a new one
        if (!foundGroup) {
          const timeKey = new Date(order.created_at).toISOString();
          groupedOrders[timeKey] = {
            id: order.id, // Use the first order's ID as the group ID
            created_at: order.created_at,
            items: [order],
          };
        }
      });

      // Fetch product details for each order item
      const ordersWithDetails = await Promise.all(
        Object.values(groupedOrders).map(async (orderGroup) => {
          const itemsWithDetails = await Promise.all(
            orderGroup.items.map(async (item) => {
              // Modified query to get all download links
              const productQuery = `*[_type == "product" && _id == $productId][0]{
                name,
                "variant": *[_type == "productVariant" && _id == $variantId][0]{
                  name,
                  downloadLinks
                }
              }`;

              const productData = await client.fetch(productQuery, {
                productId: item.product_id,
                variantId: item.variant_id,
              });

              // Get all download links that are marked as used
              const usedLinks =
                productData?.variant?.downloadLinks?.filter(
                  (link) => link.isUsed
                ) || [];

              const getQuantityFromProductData = async (
                productId,
                variantId,
                amount
              ) => {
                try {
                  // Try to get quantity from metadata first
                  if (item.metadata) {
                    const metadata =
                      typeof item.metadata === "string"
                        ? JSON.parse(item.metadata)
                        : item.metadata;

                    if (metadata.needed) {
                      return metadata.needed;
                    }
                  }

                  // Get the product price to calculate quantity
                  const priceQuery = `*[_type == "product" && _id == $productId][0]{
                    "variant": *[_type == "productVariant" && _id == $variantId][0]{
                      price
                    }
                  }`;

                  const priceData = await client.fetch(priceQuery, {
                    productId,
                    variantId,
                  });

                  const price = priceData?.variant?.price;

                  // If we have price and amount, calculate quantity
                  if (price && amount) {
                    return Math.round(amount / price);
                  }
                  return 1; // Default to 1 if we can't calculate
                } catch (error) {
                  console.error("Error getting product price:", error);
                  return 1; // Default to 1 on error
                }
              };

              // Calculate quantity based on order amount
              const quantity =
                (await getQuantityFromProductData(
                  item.product_id,
                  item.variant_id,
                  item.amount
                )) || 1;

              // Get the appropriate number of used links based on quantity
              // If we have fewer used links than the quantity, use what we have
              const relevantLinks = usedLinks.slice(0, quantity);

              // If we have no links, provide an empty array
              const downloadFilePaths =
                relevantLinks.length > 0
                  ? relevantLinks.map((link) => link.filePath)
                  : [];

              return {
                ...item,
                productName: productData?.name || "Unknown Product",
                variantName: productData?.variant?.name || "Unknown Variant",
                downloadFilePaths: downloadFilePaths,
                quantity: quantity,
              };
            })
          );

          return {
            ...orderGroup,
            items: itemsWithDetails,
            totalAmount: itemsWithDetails.reduce(
              (sum, item) => sum + item.amount,
              0
            ),
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]); // Removed fetchOrders from dependencies

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (loading && !refreshing) {
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
          <div className='flex justify-between items-center mb-4'>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className='text-2xl font-semibold text-white'
            >
              Order History
            </motion.h2>
            <Button
              onClick={handleRefresh}
              variant='outline'
              size='sm'
              className='border-none text-black hover:bg-orange/70 bg-orange'
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
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
                className='space-y-6'
              >
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    variants={item}
                    layout
                    className='bg-[#1c1c1c] p-5 rounded-lg'
                  >
                    <motion.div className='flex justify-between items-center mb-3'>
                      <motion.h3
                        variants={item}
                        className='text-lg font-medium text-white'
                      >
                        Order #{order.id.substring(0, 8)}
                      </motion.h3>
                      <motion.p
                        variants={item}
                        className='text-sm text-gray-400'
                      >
                        {new Date(order.created_at).toLocaleDateString()}
                      </motion.p>
                    </motion.div>

                    <motion.div className='space-y-4'>
                      {order.items.map((item, index) => (
                        <motion.div
                          key={`${item.id}-${index}`}
                          className='border-t border-[#333] pt-3 first:border-t-0 first:pt-0'
                        >
                          <motion.div className='flex flex-col gap-3'>
                            <div className='flex justify-between items-start'>
                              <motion.div>
                                <motion.h4
                                  variants={item}
                                  className='text-md font-medium text-white'
                                >
                                  {item.productName}
                                </motion.h4>
                                <motion.p
                                  variants={item}
                                  className='text-sm text-gray-400'
                                >
                                  {item.variantName}
                                </motion.p>
                                <motion.p
                                  variants={item}
                                  className='text-sm text-gray-400 mt-1'
                                >
                                  Amount: ${item.amount.toFixed(2)}
                                  {item.quantity > 1 && ` × ${item.quantity}`}
                                </motion.p>

                                {/* Show status badge for pending items */}
                                {item.status === "pending" && (
                                  <div className='flex items-center mt-2 text-yellow text-sm'>
                                    <Clock size={14} className='mr-1' />
                                    <span>
                                      Pending - We'll notify you when available
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                            </div>

                            {/* Display download buttons for each file path */}
                            {item.status === "paid" &&
                            item.downloadFilePaths &&
                            item.downloadFilePaths.length > 0 ? (
                              <div className='flex flex-wrap gap-2 mt-2'>
                                {item.downloadFilePaths.map(
                                  (path, pathIndex) => (
                                    <Link
                                      key={pathIndex}
                                      href={path}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                    >
                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <Button
                                          className='bg-orange text-black hover:bg-yellow focus:ring-none focus:outline-none'
                                          tabIndex={0}
                                          aria-label={`Download ${item.productName} (${pathIndex + 1}/${item.downloadFilePaths.length})`}
                                        >
                                          Download{" "}
                                          {item.downloadFilePaths.length > 1
                                            ? `#${pathIndex + 1}`
                                            : ""}
                                        </Button>
                                      </motion.div>
                                    </Link>
                                  )
                                )}
                              </div>
                            ) : item.status === "pending" ? (
                              <Button
                                className='bg-yellow text-black cursor-not-allowed mt-2'
                                disabled
                                tabIndex={-1}
                                aria-label='Pending download'
                              >
                                Pending
                              </Button>
                            ) : (
                              <Button
                                className='bg-gray-500 text-white cursor-not-allowed mt-2'
                                disabled
                                tabIndex={-1}
                                aria-label='No download available'
                              >
                                No Download
                              </Button>
                            )}
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div className='mt-4 pt-3 border-t border-[#333] flex justify-between'>
                      <motion.p className='text-white font-medium'>
                        Order Total:
                      </motion.p>
                      <motion.p className='text-white font-medium'>
                        ${order.totalAmount.toFixed(2)}
                      </motion.p>
                    </motion.div>
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
