import { ContactForm } from "@/components/contact-form";
import { AddToCartButton } from "@/components/products/AddToCartBtn";
import { getProducts, getProductVariants, getCategories } from "@/lib/sanity";
import { ChevronDown } from "lucide-react";
import { Check } from "lucide-react";

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
    <main className='min-h-screen bg-black text-white pt-24  relative font-manrope'>
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
        <h1 className='text-4xl font-bold text-center text-white mb-12 uppercase'>
          {variant.name}
        </h1>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Left Column - Product Card */}

          <div className='relative rounded-2xl bg-transparent p-6'>
            <div className='relative h-[300px] mb-6 p-6 overflow-hidden rounded-xl bg-lightBlack'>
              <div className='absolute top-0 left-1/2 -translate-x-1/2 bg-orange px-6 py-1 '>
                <span className='text-black font-bold text-2xl'>
                  ${variant.price}
                </span>
              </div>
              <img
                src={product.image}
                alt={product.name}
                className='w-full h-full object-cover border border-orange'
              />
            </div>

            <div className='space-y-4 w-full'>
              <div className='space-y-2'>
                <label className='text-white text-lg'>Quantity</label>
                <div className='relative'>
                  <select
                    defaultValue='1'
                    className='w-full bg-lightBlack text-white px-4 py-3 rounded-2xl appearance-none border border-zinc-800 focus:outline-none focus:border-orange'
                  >
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                  </select>
                  <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-orange' />
                </div>
              </div>

              <AddToCartButton
                product={product}
                variant={variant}
                className='w-full bg-orange text-black py-3 rounded-md font-semibold hover:bg-orange/90 transition-colors'
              >
                Buy Now
              </AddToCartButton>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className='space-y-8'>
            <div>
              <div className='inline-block bg-orange px-4 py-1 rounded-md mb-6'>
                <span className='text-black font-medium text-xl'>
                  INCLUDED:
                </span>
              </div>

              <ul className='space-y-4 text-lg'>
                {includedFeatures.map((feature, i) => (
                  <li key={i} className='flex items-center gap-3'>
                    <Check className='h-8 w-8 text-orange' />
                    <span className='text-gray-200'>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='space-y-4 text-xl'>
              <div className='flex justify-between items-center border border-t-white/10 border-b-white/10 border-x-0 py-4'>
                <span className='text-white'>Status:</span>
                <span className='bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent capitalize'>
                  {variant.status}
                </span>
              </div>
              <div className='flex justify-between items-center border border-b-white/10 border-x-0 border-t-0 pb-4 '>
                <span className='text-white'>Category:</span>
                <span className='bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent uppercase'>
                  {product.category ? product.category : "Uncategorized"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ContactForm />
    </main>
  );
}
