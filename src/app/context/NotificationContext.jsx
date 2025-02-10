"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useNotifications from "@/hooks/useNotifications";

const NotificationContext = createContext(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children, userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = new QueryClient();
  const { notifications } = useNotifications(userId);

  useEffect(() => {
    if (notifications) {
      const count = notifications.filter((n) => !n.read).length;
      setUnreadCount(count);
    }
  }, [notifications]);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationContext.Provider value={{ unreadCount, setUnreadCount }}>
        {children}
      </NotificationContext.Provider>
    </QueryClientProvider>
  );
};
