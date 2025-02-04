import { useState, useEffect } from "react";
import useNotifications from "@/hooks/useNotifications";
import { Bell, Check } from "lucide-react";

const NotificationCenter = ({ userId, unreadCount }) => {
  const { notifications, loading, markAsRead } = useNotifications(userId);
  const [showAll, setShowAll] = useState(false);

  // Handle marking the notification as read for the current user
  const handleMarkAsRead = async (id) => {
    await markAsRead(id); // This will be handled by the custom logic in the hook
  };

  // Count unread notifications and update the state
  useEffect(() => {
    const unreadNotifications =
      notifications?.filter((notification) => !notification.read).length || 0;
  }, [notifications]);

  if (loading) {
    return <p className='text-gray-400'>Loading notifications...</p>;
  }

  if (!notifications || notifications.length === 0) {
    return <p className='text-gray-400'>No new notifications.</p>;
  }

  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  return (
    <div>
      <ul className='space-y-2 mt-4 font-manrope'>
        {displayedNotifications.map((notification) => (
          <li
            key={notification.id}
            className={`flex justify-between items-center p-3 rounded ${
              notification.read
                ? "bg-gray-800 text-gray-400" // Read notifications
                : "bg-orange text-black" // Unread notifications
            }`}
          >
            <div className='flex items-center space-x-2'>
              <Bell className='h-5 w-5 text-black' />
              <span
                className={`text-sm ${notification.read ? "text-gray-400" : "text-black font-semibold"}`}
              >
                {notification.message}
              </span>
            </div>
            {!notification.read && (
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className='text-black hover:text-green-600'
                aria-label='Mark as read'
              >
                <Check className='h-5 w-5' />
              </button>
            )}
          </li>
        ))}
      </ul>
      {notifications.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className='mt-4 text-black hover:text-blue-300'
        >
          {showAll ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  );
};

export default NotificationCenter;
