"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const supabase = createClient();

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 3600000;

const NavAvatar = ({ user }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    fetchAvatarUrl();
  }, [user]); // Updated dependency array

  const getCachedAvatar = (key) => {
    try {
      const cached = localStorage.getItem(`avatar_${key}`);
      if (!cached) return null;

      const { url, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < CACHE_DURATION) {
        return { url, timestamp };
      }

      // Remove expired cache
      localStorage.removeItem(`avatar_${key}`);
      return null;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  };

  const setCachedAvatar = (key, url) => {
    try {
      const cacheData = {
        url,
        timestamp: Date.now(),
      };
      localStorage.setItem(`avatar_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error writing to cache:", error);
    }
  };

  const fetchAvatarUrl = async () => {
    try {
      const initialAvatarUrl = user?.user_metadata?.avatar_url;

      if (!initialAvatarUrl) {
        setAvatarUrl("/avatar-default.svg");
        return;
      }

      // Generate a cache key from the user ID and avatar URL
      const cacheKey = `${user.id}_${initialAvatarUrl}`;

      // Check cache first
      const cachedAvatar = getCachedAvatar(cacheKey);
      if (cachedAvatar) {
        setAvatarUrl(cachedAvatar.url);
        return;
      }

      // Extract the file path from the full URL if it's a Supabase URL
      let filePath = initialAvatarUrl;
      if (initialAvatarUrl.includes("/storage/v1/object/")) {
        const matches = initialAvatarUrl.match(/\/avatars\/(.+)$/);
        if (matches) {
          filePath = matches[1];
        }
      }

      // Get signed URL from the avatars bucket
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error("Error getting signed URL:", error);
        setAvatarUrl("/avatar-default.svg");
        return;
      }

      // Cache the signed URL
      setCachedAvatar(cacheKey, data.signedUrl);
      setAvatarUrl(data.signedUrl);
    } catch (error) {
      console.error("Error fetching avatar:", error);
      setAvatarUrl("/avatar-default.svg");
    }
  };

  return (
    <Avatar className='h-10 w-10 relative overflow-hidden'>
      <AvatarImage
        src={avatarUrl || "/avatar-default.svg"}
        alt={user?.user_metadata?.full_name || "User"}
        className='object-cover w-full h-full '
      />
      <AvatarFallback className='absolute inset-0 flex items-center justify-center text-lg font-medium bg-gray-100 text-gray-800'>
        {user?.user_metadata?.full_name
          ? user.user_metadata.full_name.charAt(0).toUpperCase()
          : "U"}
      </AvatarFallback>
    </Avatar>
  );
};

export default NavAvatar;
