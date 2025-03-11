"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "./context/CartContext";
import LenisProvider from "@/components/LenisProvider";
import { ProductProvider } from "./context/ProductContext";
import PromoBanner from "@/components/profile/components/promo-banner";
import NavigationObserver from "@/components/profile/components/nav-observer";

export function AppProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        queryClient.setQueryData(["user"], session.user); // Immediately set the user
        setUser(session.user);
      } else if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["user"], null); // Immediately clear the user
        setUser(null);
      }
    });

    // Get initial session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, supabase]);

  return (
    <QueryClientProvider client={queryClient}>
      <LenisProvider>
        <AuthProvider>
          <CartProvider>
            <ProductProvider>
            <NavigationObserver />
              {/* Place the PromoBanner at the top, before all other content */}
              {user && <PromoBanner createdAt={user.created_at} />}
              <div id='main-content' className='min-h-screen'>
                {children}
              </div>
              <Toaster />
            </ProductProvider>
          </CartProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </LenisProvider>
    </QueryClientProvider>
  );
}
