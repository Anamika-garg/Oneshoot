"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

// Initialize the Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Function to handle the inserts
const handleInserts = (payload) => {
  console.log('New notification received:', payload);
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to changes in the 'notifications' table using the Realtime API
    const subscription = supabase
      .channel('notifications') // Subscribe to the "notifications" channel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, // Listen to INSERT events in the notifications table
        (payload) => {
          // When a new row is inserted, update the state with the new notification
          setNotifications((prev) => [...prev, payload.new]);
          handleInserts(payload); // Log the payload for debugging
        }
      )
      .subscribe();

    // Cleanup subscription when component unmounts
    return () => {
      subscription.unsubscribe(); // Use unsubscribe() to remove the subscription
    };
  }, []);

  return notifications;
};

export default useNotifications;