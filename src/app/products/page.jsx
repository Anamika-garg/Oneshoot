"use client";
import { client } from "@/lib/sanity";

import { useState } from "react";

export default async function ProductsPage() {
  const categories = await getCategories();

  return <Products categories={categories} />;
}

async function getCategories() {
  return await client.fetch(`
    *[_type == "category"] {
      _id,
      name,
      slug,
      image
    }
  `);
}

function Products({ categories }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleCloseDialog = () => {
    setSelectedCategory(null);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Product Categories</h1>
    </div>
  );
}
