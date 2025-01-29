import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "bhxza4n3",
  dataset: "production",
  apiVersion: "2023-05-03",
  useCdn: "production",
});

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
