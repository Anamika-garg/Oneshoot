"use client";

import { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const AuthContext = createContext({
  user: null,
  isLoading: true,
  handleLogout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: Infinity, // Prevent unnecessary re-fetches
  });

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        // Immediately update the user data in the cache
        queryClient.setQueryData(["user"], session?.user || null);
      } else if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["user"], null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.setQueryData(["user"], null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);