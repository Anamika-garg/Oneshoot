"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const ProtectedComponent = ({ children }) => {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/");
        }
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Failed to verify authentication.");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  if (loading) {
    return (
      <section className='flex items-center justify-center h-screen'>
        <p className='text-xl'>Loading...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className='flex items-center justify-center h-screen'>
        <p className='text-red-500 text-xl'>{error}</p>
      </section>
    );
  }

  return <>{children}</>;
};

export default ProtectedComponent;
