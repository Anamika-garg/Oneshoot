"use client";

import { useState } from "react";
import { Check, Tag, Package, ShoppingBag, Download } from "lucide-react";
import Loader from "./ui/Loader";
import { motion, AnimatePresence } from "framer-motion";

const NotificationCenter = ({ userId, notifications, markAsRead }) => {
  const [showAll, setShowAll] = useState(false);

  if (!notifications) {
    return <Loader />;
  }

  if (notifications.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='text-gray-400'
      >
        No new notifications.
      </motion.p>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const getNotificationIcon = (notification) => {
    if (notification.promo_code_id) {
      return <Tag className='h-5 w-5' />;
    } else if (notification.product_id) {
      return <ShoppingBag className='h-5 w-5' />;
    } else if (notification.variant_id) {
      return <Download className='h-5 w-5' />;
    }
    return <Package className='h-5 w-5' />;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className='space-y-4'>
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='flex items-center gap-2 text-gray-300'
          >
            <span>Unread notifications: </span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] inline-flex items-center justify-center'
            >
              {unreadCount}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={container}
        initial='hidden'
        animate='show'
        className='space-y-2'
      >
        {displayedNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            variants={item}
            layout
            className={`flex justify-between items-center p-4 rounded-lg transition-colors ${
              notification.read
                ? "bg-[#1e2730] text-gray-400"
                : "bg-orange text-black"
            }`}
          >
            <div className='flex items-center gap-3'>
              {getNotificationIcon(notification)}
              <span
                className={`${notification.read ? "text-gray-400" : "text-black font-medium"}`}
              >
                {notification.message}
              </span>
            </div>
            {!notification.read && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMarkAsRead(notification.id)}
                className='text-black hover:text-white transition-colors'
                aria-label='Mark as read'
              >
                <Check className='h-5 w-5' />
              </motion.button>
            )}
          </motion.div>
        ))}
      </motion.div>

      {notifications.length > 5 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAll(!showAll)}
          className='text-gray-400 hover:text-white transition-colors'
        >
          {showAll ? "Show less" : "Show all"}
        </motion.button>
      )}
    </div>
  );
};

export default NotificationCenter;
