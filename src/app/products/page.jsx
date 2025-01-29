"use client";
import { client } from "@/lib/sanity";
import { CategoryDialog } from "@/components/products/CategoryDialog";
import { CategoryCard } from "@/components/products/CategoryCard";
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
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {categories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>
      {selectedCategory && (
        <CategoryDialog
          category={selectedCategory}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
