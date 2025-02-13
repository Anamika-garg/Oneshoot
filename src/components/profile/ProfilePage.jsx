"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, Shield, Bell, ShoppingCart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import useNotifications from "@/hooks/useNotifications";

import ProfileOverview from "./ProfileOverview";
import SecurityTab from "./SecurityTab";
import NotificationsTab from "./NotificationsTab";
import OrdersTab from "./OrdersTab";
import { NotificationProvider } from "@/app/context/NotificationContext";
import Loader from "../ui/Loader";

const supabase = createClient();

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTab, setSelectedTab] = useState(
    searchParams.get("tab") || "overview"
  );

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
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setSelectedTab(tab);
    }
  }, [searchParams]);

  const {
    notifications,
    loading: notificationsLoading,
    markAsRead,
  } = useNotifications(user?.id);
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const handleTabChange = (newTab) => {
    setSelectedTab(newTab);
    router.push(`/account?tab=${newTab}`, undefined, { shallow: true });
  };

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
    <NotificationProvider>
      <div className='min-h-screen bg-black text-white p-4 md:p-6 mt-24 md:mt-32 relative'>
        <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold leading-snug mb-4 md:mb-8 font-manrope uppercase text-center bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
          Profile overview
        </h1>

        <Tabs
          value={selectedTab}
          onValueChange={handleTabChange}
          className='w-full mt-8 md:mt-16 z-20 relative'
        >
          <TabsList className='grid w-full grid-cols-2 md:grid-cols-4 mb-6 md:mb-8 bg-lightBlack p-0'>
            <TabsTrigger
              value='overview'
              className='flex items-center justify-center gap-2 '
              aria-label='Profile overview'
            >
              <UserIcon className='h-5 w-5' />
              <span className='hidden md:inline'>Profile overview</span>
            </TabsTrigger>
            <TabsTrigger
              value='security'
              className='flex items-center justify-center gap-2 '
              aria-label='Security settings'
            >
              <Shield className='h-5 w-5' />
              <span className='hidden md:inline'>Security</span>
            </TabsTrigger>
            <TabsTrigger
              value='notifications'
              className='flex items-center justify-center gap-2 '
              aria-label='Notification settings'
            >
              <Bell className='h-5 w-5' />
              <div className='flex items-center gap-1'>
                <span className='hidden md:inline'>Notifications</span>
                {unreadCount > 0 && (
                  <span className='bg-red-500 text-white text-xs rounded-full px-1 py-0.5 w-5 h-5'>
                    {unreadCount}
                  </span>
                )}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value='orders'
              className='flex items-center justify-center gap-2 '
              aria-label='Order history'
            >
              <ShoppingCart className='h-5 w-5' />
              <span className='hidden md:inline'>Orders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <ProfileOverview user={user} />
          </TabsContent>

          <TabsContent value='security'>
            <SecurityTab currentEmail={user.email} />
          </TabsContent>

          <TabsContent value='notifications'>
            <NotificationsTab
              user={user}
              notifications={notifications}
              markAsRead={markAsRead}
            />
          </TabsContent>

          <TabsContent value='orders'>
            <OrdersTab user={user} />
          </TabsContent>
        </Tabs>
        <div className='absolute top-1/2 md:top-10 -right-20 md:-right-40 h-80 md:h-[420px] w-80 md:w-[420px] rounded-full blur-[220px] md:blur-[320px] pointer-events-none bg-orange z-0'></div>
      </div>
    </NotificationProvider>
  );
};

export default ProfilePage;
