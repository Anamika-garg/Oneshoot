"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, Shield, Bell, ShoppingCart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ProfileOverview from "./ProfileOverview";
import SecurityTab from "./SecurityTab";
import NotificationsTab from "./NotificationsTab";
import OrdersTab from "./OrdersTab";
import useNotifications from "@/hooks/useNotifications";
import Loader from "../ui/Loader";

const ProfilePage = () => {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase]);

  const { notifications, loading: notificationsLoading } = useNotifications(
    user?.id
  );

  useEffect(() => {
    if (notifications) {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.read
      ).length;
      setUnreadCount(unreadNotifications);
    }
  }, [notifications]);

  if (loading || notificationsLoading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black text-white p-6 mt-32 relative'>
      <h1 className='text-4xl md:text-5xl font-bold leading-snug mb-4 md:mb-8 font-manrope uppercase text-center bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
        Profile overview
      </h1>

      <Tabs defaultValue='overview' className='w-full mt-16 z-20 relative'>
        <TabsList className='grid w-full grid-cols-4 mb-8 bg-lightBlack'>
          <TabsTrigger
            value='overview'
            className='flex items-center gap-2'
            aria-label='Profile overview'
          >
            <UserIcon className='h-4 w-4' />
            Profile overview
          </TabsTrigger>
          <TabsTrigger
            value='security'
            className='flex items-center gap-2'
            aria-label='Security settings'
          >
            <Shield className='h-4 w-4' />
            Security
          </TabsTrigger>
          <TabsTrigger
            value='notifications'
            className='flex items-center gap-2'
            aria-label='Notification settings'
          >
            <Bell className='h-4 w-4' />
            <div className='flex items-center gap-1'>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className='bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 w-5 h-5'>
                  {unreadCount}
                </span>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger
            value='orders'
            className='flex items-center gap-2'
            aria-label='Order history'
          >
            <ShoppingCart className='h-4 w-4' />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <ProfileOverview user={user} />
        </TabsContent>

        <TabsContent value='security'>
          <SecurityTab currentEmail={user.email} />
        </TabsContent>

        <TabsContent value='notifications'>
          <NotificationsTab user={user} unreadCount={unreadCount} />
        </TabsContent>

        <TabsContent value='orders'>
          <OrdersTab user={user} />
        </TabsContent>
      </Tabs>
      <div className='absolute top-1/2 md:top-10 -right-20 md:-right-40 h-80 md:h-[420px] w-80 md:w-[420px] rounded-full blur-[220px] md:blur-[320px] pointer-events-none bg-orange z-0'></div>
    </div>
  );
};

export default ProfilePage;
