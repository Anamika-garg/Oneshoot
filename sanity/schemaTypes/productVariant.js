// Updated productVariant schema - simplified for your workflow
export default {
  name: 'productVariant',
  type: 'document',
  title: 'Product Variant',
  fields: [
    {name: 'name', type: 'string', title: 'Variant Name', validation: (Rule) => Rule.required()},
    {
      name: 'slug',
      type: 'slug',
      options: {source: 'name'},
      title: 'Slug',
      validation: (Rule) => Rule.required(),
    },
    {name: 'price', type: 'number', title: 'Price', validation: (Rule) => Rule.required().min(0)},
    {name: 'description', type: 'text', title: 'Description', rows: 3},
    // Remove the single downloadFilePath field
    // Add a new array of download links
    {
      name: 'downloadLinks',
      title: 'Download Links',
      description: 'Add multiple Supabase links for this product. They will be used in order.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'filePath',
              type: 'string',
              title: 'File Path',
              description: 'Supabase storage link from product-files bucket',
            },
            {
              name: 'isUsed',
              type: 'boolean',
              title: 'Is Used',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: 'filePath',
              used: 'isUsed',
            },
            prepare({title, used}) {
              return {
                title: title,
                subtitle: used ? '✓ Used' : '○ Available',
              }
            },
          },
        },
      ],
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
