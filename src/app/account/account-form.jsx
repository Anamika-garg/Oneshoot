"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon, Shield, Bell, ShoppingCart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import UpdatePasswordForm from "@/components/security/UpdatePasswordForm";
import UpdateEmailForm from "@/components/security/UpdateEmailForm";
import AuthGuard from "@/components/ProtectedRoute";
import Notifications, { NotificationCenter } from "@/components/Notifications";

export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
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
    }

    getUser();
  }, []);

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
          <TabsTrigger value='overview' className='flex items-center gap-2'>
            <UserIcon className='h-4 w-4' />
            Profile overview
          </TabsTrigger>
          <TabsTrigger value='security' className='flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            Security
          </TabsTrigger>
          <TabsTrigger
            value='notifications'
            className='flex items-center gap-2'
          >
            <Bell className='h-4 w-4' />
            Notifications
          </TabsTrigger>
          <TabsTrigger value='orders' className='flex items-center gap-2'>
            <ShoppingCart className='h-4 w-4' />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card className='bg-gray-900 border-gray-800'>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-gray-400 mb-1'>Username</h3>
                    <p className='text-xl text-white'>
                      {user.user_metadata.full_name || "Not set"}
                    </p>
                  </div>
                  <div>
                    <h3 className='text-gray-400 mb-1'>Joined</h3>
                    <p className='text-xl text-white'>
                      {new Date(user.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-gray-900 border-gray-800'>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-gray-400 mb-1'>Email</h3>
                    <p className='text-xl text-white'>{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='mt-8'>
            <h2 className='text-2xl font-semibold mb-4'>Latest orders</h2>
            <Card className='bg-gray-900 border-gray-800'>
              <CardContent className='p-6'>
                <div className='text-gray-400'>There are no orders</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='security'>
          <AuthGuard>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* Update Email Card - spans 2 columns on medium screens and above */}
              <Card className='md:col-span-2 border-white'>
                <CardContent className='p-6 bg-[#0E0E0E] rounded-lg'>
                  <h2 className='text-2xl font-semibold mb-6 text-white'>
                    Update Email
                  </h2>
                  <UpdateEmailForm currentEmail={user.email} />
                </CardContent>
              </Card>

              {/* Change Password Card - spans 1 column */}
              <Card className='md:col-span-1 bg-gray-900 border-white'>
                <CardContent className='p-6 bg-[#0E0E0E] rounded-lg h-full flex flex-col '>
                  <h2 className='text-2xl font-semibold mb-6 text-white'>
                    Change Password
                  </h2>
                  <div className='flex-grow'>
                    <UpdatePasswordForm />
                  </div>
                </CardContent>
              </Card>
            </div>
          </AuthGuard>
        </TabsContent>

        <TabsContent value='notifications'>
          <Card className='bg-gray-900 border-gray-800'>
            <CardContent className='p-6'>
              <h2 className='text-2xl font-semibold mb-4 text-white'>
                Notification Preferences
              </h2>
              <NotificationCenter />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='orders'>
          <Card className='bg-gray-900 border-gray-800'>
            <CardContent className='p-6'>
              <h2 className='text-2xl font-semibold mb-4 text-white'>
                Order History
              </h2>
              <p className='text-gray-400'>
                Your order history will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
