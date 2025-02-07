"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/sanity";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Loader from "../ui/Loader";

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

  return (
    <Card className='bg-lightBlack border-none'>
      <CardContent className='p-6'>
        <h2 className='text-2xl font-semibold mb-4 text-white'>
          Order History
        </h2>
        {orders.length === 0 ? (
          <p className='text-gray-400'>You have no completed orders yet.</p>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => (
              <div key={order.id} className='bg-[#1c1c1c] p-4 rounded-lg'>
                <h3 className='text-lg font-medium text-white mb-2'>
                  {order.productName} - {order.variantName}
                </h3>
                <p className='text-sm text-gray-400 mb-2'>
                  Order Date: {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className='text-sm text-gray-400 mb-2'>
                  Amount: ${order.amount.toFixed(2)}
                </p>
                {order.downloadFilePath && (
                  <Link href={order.downloadFilePath} className='w-full'>
                    <Button
                      className='bg-orange text-black hover:bg-yellow-400 focus:ring-none focus:outline-none '
                      tabIndex={0}
                      aria-label={`Download ${order.productName}`}
                    >
                      Download
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
