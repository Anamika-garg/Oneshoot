"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useCustomToast } from "@/hooks/useCustomToast";

const supabase = createClient();

const LogoutBtn = () => {
  const queryClient = useQueryClient();
  const customToast = useCustomToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      // Clear all queries from the cache
      queryClient.clear();

      // Update the user state immediately
      queryClient.setQueryData(["user"], null);

      customToast.success("Logged out successfully");

      // Navigate to login page
      router.push("/login");
      router.refresh();
    } catch (error) {
      customToast.error("Error logging out");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant='ghost'
      className='flex items-center space-x-1 text-red-400 hover:text-red-300 bg-transparent hover:bg-transparent pl-1 rounded transition-colors text-base w-full justify-start'
    >
      <LogOut className='w-5 h-5' />
      <span>Sign Out</span>
    </Button>
  );
};

export default LogoutBtn;
