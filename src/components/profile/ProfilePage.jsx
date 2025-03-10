"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, Shield, Bell, ShoppingCart } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import useNotifications from "@/hooks/useNotifications";
import { motion } from "framer-motion";

import ProfileOverview from "./ProfileOverview";
import SecurityTab from "./SecurityTab";
import NotificationsTab from "./NotificationsTab";
import OrdersTab from "./OrdersTab";
import { NotificationProvider } from "@/app/context/NotificationContext";
import Loader from "../ui/Loader";
import { FadeInWhenVisible } from "../ui/FadeInWhenVisible";
import PromoBanner from "./components/promo-banner";

const supabase = createClient();

const AnimatedTabs = ({ selectedTab, onTabChange, unreadCount = 0 }) => {
  const tabRefs = useRef(new Map());
  const [activeTabWidth, setActiveTabWidth] = useState(0);
  const [activeTabLeft, setActiveTabLeft] = useState(0);

  useEffect(() => {
    const activeTab = tabRefs.current.get(selectedTab);
    if (activeTab) {
      const { offsetWidth, offsetLeft } = activeTab;
      setActiveTabWidth(offsetWidth);
      setActiveTabLeft(offsetLeft);
    }
  }, [selectedTab]);

  const tabs = [
    { id: "overview", icon: UserIcon, label: "Profile overview" },
    { id: "security", icon: Shield, label: "Security" },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      count: unreadCount,
    },
    { id: "orders", icon: ShoppingCart, label: "Orders" },
  ];

  return (
    <TabsList className='relative grid w-full grid-cols-2 md:grid-cols-4 mb-6 md:mb-8 bg-lightBlack p-0 h-10'>
      <motion.div
        className='absolute h-full bg-white rounded-md z-0'
        animate={{
          width: activeTabWidth,
          x: activeTabLeft,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.7,
        }}
      />
      {tabs.map(({ id, icon: Icon, label, count }) => (
        <TabsTrigger
          key={id}
          value={id}
          ref={(el) => tabRefs.current.set(id, el)}
          onClick={() => onTabChange(id)}
          className={`
            relative flex items-center justify-center gap-2 h-10
           transition-colors duration-200
            z-10 group data-[state=active]:text-black
            ${selectedTab === id ? "" : "text-white hover:text-white/80"}
          `}
        >
          <Icon
            className={`
            h-5 w-5 
            transition-colors duration-700 ease-in-out
            ${selectedTab === id ? "text-black" : "text-white group-hover:text-white/80"}
          `}
          />
          <span
            className={`
            hidden md:inline
            transition-colors duration-700 ease-in-out
            ${selectedTab === id ? "text-black" : "text-white group-hover:text-white/80"}
          `}
          >
            {label}
          </span>
          {typeof count === "number" && count > 0 && id === "notifications" && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`
                text-xs rounded-full px-1 py-0.5 min-w-[20px] h-5 
                flex items-center justify-center
                ${selectedTab === id ? "bg-black text-white" : "bg-red-500 text-white"}
                transition-colors duration-700 ease-in-out
              `}
            >
              {count}
            </motion.span>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTab, setSelectedTab] = useState("overview"); // Default to 'overview'
  const {
    notifications,
    loading: notificationsLoading,
    markAsRead,
    refetchNotifications,
  } = useNotifications(user?.id);

  // Calculate unread count
  const unreadCount = notifications?.filter((n) => !n.read)?.length || 0;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
        } else {
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  useEffect(() => {
    // Function to check if banner is visible and adjust spacing
    const adjustBannerSpacing = () => {
      const banner = document.querySelector(".fixed.top-20.z-50"); // Banner selector
      const spacer = document.getElementById("banner-spacer");

      if (banner && spacer) {
        // Check if banner is actually visible (not display: none)
        const isVisible = window.getComputedStyle(banner).display !== "none";

        if (isVisible) {
          spacer.className = "h-20 md:h-24"; // Add space when banner is visible
        } else {
          spacer.className = "h-0"; // No space when banner is hidden
        }
      }
    };

    // Run once on mount
    adjustBannerSpacing();

    // Set up a small delay to ensure the banner has had time to render/hide
    const timeoutId = setTimeout(adjustBannerSpacing, 500);

    // Also run when window is resized
    window.addEventListener("resize", adjustBannerSpacing);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", adjustBannerSpacing);
    };
  }, []);

  // Update selectedTab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setSelectedTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setSelectedTab(newTab);
    router.push(`/account?tab=${newTab}`, undefined, { shallow: true });

    // Refetch notifications when switching to notifications tab
    if (newTab === "notifications") {
      refetchNotifications();
    }
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
      {user && (
        <>
          <PromoBanner
            createdAt={user.created_at || user.user_metadata?.created_at}
          />
        </>
      )}
      <div id='banner-spacer' className='h-0'>
        {/* This spacer's height will be controlled by JavaScript */}
      </div>
      <div className='min-h-screen bg-black text-white p-4 md:p-6 mt-24 md:mt-32 relative'>
        <FadeInWhenVisible>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold leading-snug mb-4 md:mb-8 font-manrope uppercase text-center bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
            Profile overview
          </h1>
        </FadeInWhenVisible>

        <Tabs
          value={selectedTab}
          onValueChange={handleTabChange}
          className='w-full mt-8 md:mt-16 z-20 relative'
        >
          <AnimatedTabs
            selectedTab={selectedTab}
            onTabChange={handleTabChange}
            unreadCount={unreadCount}
          />

          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <TabsContent value='overview'>
              <ProfileOverview user={user} />
            </TabsContent>

            <TabsContent value='security'>
              <SecurityTab currentEmail={user.email} />
            </TabsContent>

            <TabsContent value='notifications'>
              <NotificationsTab
                user={user}
                notifications={notifications || []}
                markAsRead={markAsRead}
                onRefresh={refetchNotifications}
              />
            </TabsContent>

            <TabsContent value='orders'>
              <OrdersTab user={user} />
            </TabsContent>
          </motion.div>
        </Tabs>
        <div className='absolute top-1/2 md:top-10 -right-20 md:-right-40 h-80 md:h-[420px] w-80 md:w-[420px] rounded-full blur-[220px] md:blur-[320px] pointer-events-none bg-orange z-0'></div>
      </div>
    </NotificationProvider>
  );
};

export default ProfilePage;
