import useNotifications from "@/hooks/useNotifications";
import { useState, useEffect } from "react";


export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]); // Initialize notifications state
  const { notifications: newNotifications } = useNotifications();

  useEffect(() => {
    setNotifications(newNotifications); // Update notifications with the latest data
  }, [newNotifications]);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  if (notifications.length === 0) {
    return <p className="text-gray-400">No new notifications.</p>;
  }

  return (
    <ul>
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className="flex justify-between items-center p-2 bg-gray-800 rounded mb-2"
        >
          <span className="text-gray-300">{notification.message}</span>
          <button
            onClick={() => handleMarkAsRead(notification.id)}
            className="text-red-500"
            aria-label={`Mark notification ${notification.id} as read`}
          >
            Mark as read
          </button>
        </li>
      ))}
    </ul>
  );
};