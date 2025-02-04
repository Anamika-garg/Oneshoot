import { Card, CardContent } from "@/components/ui/card";

const OrdersTab = () => {
  return (
    <Card className='bg-lightBlack border-none'>
      <CardContent className='p-6'>
        <h2 className='text-2xl font-semibold mb-4 text-white'>
          Order History
        </h2>
        <p className='text-gray-400'>
          Your order history will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
};

export default OrdersTab;
