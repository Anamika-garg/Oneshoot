export default {
  name: 'product',
  type: 'document',
  title: 'Product',
  fields: [
    {name: 'name', type: 'string', title: 'Name', validation: (Rule) => Rule.required()},
    {
      name: 'slug',
      type: 'slug',
      options: {source: 'name'},
      title: 'Slug',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      type: 'reference',
      to: {type: 'category'},
      title: 'Category',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'basePrice',
      type: 'number',
      title: 'Base Price',
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'image',
      type: 'image',
      title: 'Main Image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'variants',
      type: 'array',
      title: 'Product Variants',
      of: [{type: 'reference', to: {type: 'productVariant'}}],
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: 'status',
      type: 'string',
      title: 'Status',
      options: {
        list: ['available', 'out-of-stock'],
        layout: 'radio',
      },
      initialValue: 'available',
    },
  ],
}
