import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

// Real-time subscription to notifications
const useNotifications = () => {
  const supabase = createClient();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to changes in the 'notifications' table
    const subscription = supabase
      .from("notifications")
      .on("INSERT", (payload) => {
        setNotifications((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [supabase]);

  return notifications;
};

export default useNotifications;
