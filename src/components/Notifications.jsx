// components/Notifications.js
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
      } else {
        setNotifications(data);
      }
    };

    fetchNotifications();

    const notificationsSubscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.new.user_id === userId) {
            setNotifications((prevNotifications) => [
              payload.new,
              ...prevNotifications,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsSubscription);
    };
  }, [userId]);

  const handleMarkAsRead = async (notificationId) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
    } else {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  return (
    <div className='space-y-4'>
      {notifications.length === 0 ? (
        <p className='text-gray-400'>No notifications</p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg ${
              notification.read ? "bg-gray-800" : "bg-gray-700"
            }`}
          >
            <p className='text-white'>{notification.message}</p>
            <p className='text-sm text-gray-400 mt-2'>
              {new Date(notification.created_at).toLocaleString()}
            </p>
            {!notification.read && (
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className='mt-2 text-sm text-blue-400 hover:text-blue-300'
              >
                Mark as read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
