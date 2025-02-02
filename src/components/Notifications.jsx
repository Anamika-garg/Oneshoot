import { useState } from "react";
import useNotifications from "@/hooks/useNotifications";
import { Bell, Check } from "lucide-react";

const NotificationCenter = ({ userId }) => {
  const { notifications, loading, markAsRead } = useNotifications(userId);
  const [showAll, setShowAll] = useState(false);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

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
      <ul className='space-y-2'>
        {displayedNotifications.map((notification) => (
          <li
            key={notification.id}
            className={`flex justify-between items-center p-3 rounded ${
              notification.read ? "bg-gray-800" : "bg-gray-700"
            }`}
          >
            <div className='flex items-center space-x-2'>
              <Bell className='h-5 w-5 text-blue-400' />
              <span
                className={`text-sm ${notification.read ? "text-gray-400" : "text-white"}`}
              >
                {notification.message}
              </span>
            </div>
            {!notification.read && (
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className='text-blue-400 hover:text-blue-300'
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
          className='mt-4 text-blue-400 hover:text-blue-300'
        >
          {showAll ? "Show less" : "Show all"}
        </button>
      )}
    </div>
  );
};

export default NotificationCenter;
