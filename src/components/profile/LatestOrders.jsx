"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { client } from "@/lib/sanity";
import { createClient } from "@/utils/supabase/client";

// Initialize the Supabase client.
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

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className='text-red-500'>Error loading orders.</div>;
  }

  return (
    <Card className='bg-lightBlack border-none'>
      <CardContent className='p-6'>
        {orders && orders.length === 0 ? (
          <p className='text-gray-400'>You have no completed orders yet.</p>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => (
              <div key={order.id} className='bg-[#1c1c1c] p-4 rounded-lg'>
                <h3 className='text-lg font-medium text-white mb-2'>
                  {order.productName} – {order.variantName}
                </h3>
                <p className='text-sm text-gray-400 mb-2'>
                  Order Date: {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className='text-sm text-gray-400 mb-2'>
                  Amount: ${order.amount.toFixed(2)}
                </p>
                {order.downloadFilePath && (
                  <Link href={order.downloadFilePath}>
                    <Button
                      className='bg-orange text-black hover:bg-yellow focus:ring-none focus:outline-none'
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
        <div className='mt-4 '>
          <Button
            className='bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent font-semibold text-lg '
            onClick={() => router.push("/account?tab=orders")}
          >
            View All Orders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LatestOrders;
