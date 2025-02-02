import { useState, useEffect } from "react";
import useNotifications from "@/hooks/useNotifications"; // Assuming this hook is stored in the /hooks folder

const NotificationCenter = ({ user }) => {
  const notifications = useNotifications();

  if (!notifications || notifications.length === 0) {
    return <p className='text-gray-400'>No new notifications.</p>;
  }

  return (
    <ul>
      {notifications.map((notification, index) => (
        <li
          key={index}
          className='flex justify-between items-center p-2 bg-gray-800 rounded mb-2'
        >
          <span className='text-gray-300'>{notification.message}</span>
        </li>
      ))}
    </ul>
  );
};

export default NotificationCenter;
