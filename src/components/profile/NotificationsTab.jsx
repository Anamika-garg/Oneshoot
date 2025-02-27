"use client";

import { Card, CardContent } from "@/components/ui/card";
import NotificationCenter from "../Notifications";
import { motion } from "framer-motion";
import { FadeInWhenVisible } from "../ui/FadeInWhenVisible";

const NotificationsTab = ({ user, notifications, markAsRead }) => {
  return (
    <FadeInWhenVisible>
      <Card className='bg-lightBlack border-none mt-10'>
        <CardContent className='p-6 bg-lightBlack'>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className='text-2xl font-semibold mb-4 text-white'
          >
            Notification Center
          </motion.h2>

          <NotificationCenter
            userId={user.id}
            notifications={notifications}
            markAsRead={markAsRead}
          />
        </CardContent>
      </Card>
    </FadeInWhenVisible>
  );
};

export default NotificationsTab;
