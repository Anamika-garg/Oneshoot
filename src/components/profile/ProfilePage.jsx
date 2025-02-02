"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, Shield, Bell, ShoppingCart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ProfileOverview from "./ProfileOverview";
import SecurityTab from "./SecurityTab";
import NotificationsTab from "./NotificationsTab";
import OrdersTab from "./OrdersTab";

const ProfilePage = () => {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [supabase]); // Added supabase to the dependency array

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black text-white p-6 mt-32'>
      <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold leading-snug mb-4 md:mb-8 font-manrope uppercase text-center bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
        Profile overview
      </h1>

      <Tabs defaultValue='overview' className='w-full mt-16'>
        <TabsList className='grid w-full grid-cols-4 mb-8 bg-[#0E0E0E]'>
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
            Notifications
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
          <NotificationsTab user={user} />
        </TabsContent>

        <TabsContent value='orders'>
          <OrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
