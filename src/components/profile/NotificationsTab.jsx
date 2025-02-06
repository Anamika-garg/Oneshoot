"use client";

import { Card, CardContent } from "@/components/ui/card";
import NotificationCenter from "../Notifications";

const NotificationsTab = ({ user, notifications, markAsRead }) => {
  return (
    <Card className='bg-gray-900 border-none'>
      <CardContent className='p-6 bg-lightBlack'>
        <h2 className='text-2xl font-semibold mb-4 text-white'>
          Notification Center
        </h2>

        <NotificationCenter
          userId={user.id}
          notifications={notifications}
          markAsRead={markAsRead}
        />
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
