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
    {
      name: 'downloadFilePath',
      title: 'Download File Path',
      type: 'string',
      description: 'Path to the file in Supabase Storage'
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
