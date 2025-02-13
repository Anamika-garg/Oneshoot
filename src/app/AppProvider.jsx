"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "./context/CartContext";
import LenisProvider from "@/components/LenisProvider";

export function AppProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        queryClient.setQueryData(["user"], session.user); // Immediately set the user
      } else if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["user"], null); // Immediately clear the user
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, supabase]);

  return (
    <QueryClientProvider client={queryClient}>
      <LenisProvider>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </LenisProvider>
    </QueryClientProvider>
  );
}
