import { ContactForm } from "@/components/contact-form";
import { ProductDetails } from "@/components/products/ProductDetails";

import { getProducts, getProductVariants } from "@/lib/sanity";

// Disable page caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  const products = await getProducts();
  const paths = [];

  for (const product of products) {
    const variants = await getProductVariants(product._id);
    for (const variant of variants.variants) {
      paths.push({
        productSlug: product.slug,
        variantSlug: variant.slug,
      });
    }
  }

  return paths;
}

export default async function ProductPage({ params }) {
  const { productSlug, variantSlug } = params;

  // Add cache busting timestamp to ensure fresh data
  const timestamp = Date.now();

  // Force fresh data fetch on each request
  const products = await getProducts();
  const product = products.find((p) => p.slug === productSlug);

  if (!product) {
    return <div>Product not found</div>;
  }

  // Force fresh data fetch for variants
  const variants = await getProductVariants(product._id);
  const variant = variants.variants.find((v) => v.slug === variantSlug);

  if (!variant) {
    return <div>Variant not found</div>;
  }

  // Add timestamp to variant to ensure client has fresh data
  const freshVariant = {
    ...variant,
    _timestamp: timestamp,
  };

  // Find category name
  const category = product.category || null;

  // Parse the description string into an array of features
  const includedFeatures = freshVariant.description
    ? freshVariant.description.split("\n").filter(Boolean)
    : [];

  return (
    <main className='min-h-screen bg-black text-white pt-24 relative font-manrope'>
      <div className='absolute inset-0' />

      {/* Glowing effect that extends behind the navbar */}
      <div className='absolute top-0 left-0 right-0 h-[150vh] pointer-events-none hidden md:block'>
        <div className='absolute top-1/3 right-0 transform -translate-x-2 -translate-y-1/2'>
          <div className='w-[340px] h-[420px] rounded-full bg-orange blur-[260px] opacity-80' />
        </div>
        <div className='absolute top-0 left-10 transform translate-x-2 translate-y-1/2'>
          <div className='w-[340px] h-[420px] rounded-full bg-orange blur-[260px] opacity-90' />
        </div>
      </div>
      <div className='container mx-auto px-4 mb-24'>
        <h1 className='text-5xl font-bold text-center text-white mb-12 uppercase'>
          {freshVariant.name}
        </h1>

        <ProductDetails
          product={product}
          variant={freshVariant}
          category={category}
          includedFeatures={includedFeatures}
          timestamp={timestamp}
        />
      </div>
      <ContactForm />
    </main>
  );
}
