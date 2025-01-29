export default {
  name: "category",
  type: "document",
  title: "Category",
  fields: [
    { name: "name", type: "string", title: "Name", validation: Rule => Rule.required() },
    { name: "slug", type: "slug", options: { source: "name" }, title: "Slug", validation: Rule => Rule.required() },
    { name: "image", type: "image", title: "Image", options: { hotspot: true }, validation: Rule => Rule.required() },
  ],
};