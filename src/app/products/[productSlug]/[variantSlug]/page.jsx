import { ContactForm } from "@/components/contact-form";
import { ProductDetails } from "@/components/products/ProductDetails";

import { getProducts, getProductVariants, getCategories } from "@/lib/sanity";

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
  const { productSlug, variantSlug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === productSlug);
  const variants = await getProductVariants(product._id);
  const variant = variants.variants.find((v) => v.slug === variantSlug);

  // Find category name
  const category = product.category || null;

  if (!product || !variant) {
    return <div>Product not found</div>;
  }

  // Parse the description string into an array of features
  const includedFeatures = variant.description
    ? variant.description.split("\n").filter(Boolean)
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
          {variant.name}
        </h1>

        <ProductDetails
          product={product}
          variant={variant}
          category={category}
          includedFeatures={includedFeatures}
        />
      </div>
      <ContactForm />
    </main>
  );
}
