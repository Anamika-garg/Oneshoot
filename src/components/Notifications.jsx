"use client";

import { useEffect, useState } from "react";

import { Bell } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.filter((n) => !n.read).length || 0);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkAsRead = async (id) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error);
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      handleToggle();
    }
  };

  return (
    <div className='relative'>
      <button
        className='p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-label='Notifications'
        aria-haspopup='true'
        aria-expanded={isOpen}
      >
        <Bell className='h-6 w-6 text-gray-600' />
        {unreadCount > 0 && (
          <span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full'>
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className='absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10'>
          <div className='py-2'>
            <h3 className='text-lg font-medium text-gray-900 px-4 py-2'>
              Notifications
            </h3>
            <div className='divide-y divide-gray-200'>
              {notifications.length === 0 ? (
                <p className='px-4 py-2 text-sm text-gray-500'>
                  No notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-2 hover:bg-gray-50 transition duration-150 ease-in-out ${
                      notification.read ? "bg-white" : "bg-blue-50"
                    }`}
                  >
                    <p className='text-sm text-gray-900'>
                      {notification.message}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {!notification.read && (
                      <button
                        className='mt-1 text-xs text-indigo-600 hover:text-indigo-900'
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
