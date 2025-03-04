import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "bhxza4n3",
  dataset: "production",
  apiVersion: "2023-05-03",
  useCdn: true,
});

export const writeClient = createClient({
  projectId: "bhxza4n3",
  dataset: "production",
  apiVersion: "2023-05-03",
  useCdn: false,
  token: process.env.SANITY_LINK_EDIT_KEY, // Add your write token here
});

export async function cleanupDownloadLink(variantId, filePath, downloadLinks) {
  try {
    const response = await fetch("/api/cleanup-download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variantId,
        filePath,
        downloadLinks,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cleanup download link");
    }

    return await response.json();
  } catch (error) {
    console.error("Error cleaning up download link:", error);
    throw error;
  }
}

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);

export const getCategories = () =>
  client.fetch(`
  *[_type == "category"] {
    _id,
    name,
    "slug": slug.current,
    "image": image.asset->url
  }
`);

export const getProducts = () =>
  client.fetch(`
  *[_type == "product"] {
    _id,
    name,
    "slug": slug.current,
    "category": category->name,
    basePrice,
    "image": image.asset->url,
    status,
    "variants": variants[]->
  }
`);

export const getProductVariants = (productId) =>
  client.fetch(
    `
  *[_type == "product" && _id == $productId][0] {
    "variants": variants[]-> {
      _id,
      name,
      "slug": slug.current,
      price,
      description,
      status
    }
  }
`,
    { productId }
  );

export const getPromoCode = (code) =>
  client.fetch(
    `
      *[_type == "promoCode" && code == $code][0] {
        code,
        discount,
        isPercentage,
        validFrom,
        validTo,
        notificationText
      }
    `,
    { code }
  );
