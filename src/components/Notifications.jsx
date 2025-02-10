"use client";

import { useState } from "react";
import { Bell, Check, Tag } from "lucide-react";
import Loader from "./ui/Loader";


const NotificationCenter = ({ userId, notifications, markAsRead }) => {
  const [showAll, setShowAll] = useState(false);

  if (!notifications) {
    return <Loader />;
  }

  if (notifications.length === 0) {
    return <p className='text-gray-400'>No new notifications.</p>;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const getNotificationIcon = (itemType) => {
    switch (itemType) {
      case "promoCode":
        return <Tag className={`h-5 w-5`} />;
      default:
        return <Bell className={`h-5 w-5`} />;
    }
  };

  return (
    <div className='space-y-4'>
      {unreadCount > 0 && (
        <div className='flex items-center gap-2 text-gray-300'>
          <span>Unread notifications: </span>
          <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] inline-flex items-center justify-center'>
            {unreadCount}
          </span>
        </div>
      )}
      <div className='space-y-2'>
        {displayedNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex justify-between items-center p-4 rounded-lg transition-colors ${
              notification.read
                ? "bg-[#1e2730] text-gray-400"
                : "bg-orange text-black"
            }`}
          >
            <div className='flex items-center gap-3'>
              {getNotificationIcon(notification.item_type)}
              <span
                className={`${notification.read ? "text-gray-400" : "text-black font-medium"}`}
              >
                {notification.message}
              </span>
            </div>
            {!notification.read && (
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className='text-black hover:text-white transition-colors'
                aria-label='Mark as read'
              >
                <Check className='h-5 w-5' />
              </button>
            )}
          </div>
        ))}
      </div>
      {notifications.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className='text-gray-400 hover:text-white transition-colors'
        >
          {showAll ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  );
};

export default NotificationCenter;
