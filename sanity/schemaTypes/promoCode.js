export default {
  name: 'promoCode',
  title: 'Promo Code',
  type: 'document',
  fields: [
    {
      name: 'code',
      title: 'Code',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'discount',
      title: 'Discount',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).max(100),
    },
    {
      name: 'isPercentage',
      title: 'Is Percentage',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'validFrom',
      title: 'Valid From',
      type: 'datetime',
    },
    {
      name: 'validTo',
      title: 'Valid To',
      type: 'datetime',
    },
    {
      name: 'notificationText',
      title: 'Notification Text',
      type: 'text',
    },
  ],
}
