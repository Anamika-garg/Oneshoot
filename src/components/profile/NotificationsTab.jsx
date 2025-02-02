import { Card, CardContent } from "@/components/ui/card";
import NotificationCenter from "../Notifications";


const NotificationsTab = ({ user }) => {
  return (
    <Card className='bg-gray-900 border-gray-800'>
      <CardContent className='p-6'>
        <h2 className='text-2xl font-semibold mb-4 text-white'>
          Notification Center
        </h2>
        <NotificationCenter userId={user.id} />
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
