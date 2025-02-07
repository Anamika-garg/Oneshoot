"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarUpload from "@/components/profile/AvatarUpload";

const supabase = createClient();

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 3600000;

const ProfileAvatar = ({ userId, initialAvatarUrl }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvatarUrl();
  }, [initialAvatarUrl, userId]);

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
      setLoading(true);

      // If there's no initialAvatarUrl, use default avatar
      if (!initialAvatarUrl) {
        setAvatarUrl("/avatar-default.svg");
        setLoading(false);
        return;
      }

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        setAvatarUrl("/avatar-default.svg");
        setLoading(false);
        return;
      }

      // Generate a cache key from the user ID and avatar URL
      const cacheKey = `${userId}_${initialAvatarUrl}`;

      // Check cache first
      const cachedAvatar = getCachedAvatar(cacheKey);
      if (cachedAvatar) {
        setAvatarUrl(cachedAvatar.url);
        setLoading(false);
        return;
      }

      let filePath = initialAvatarUrl;
      if (initialAvatarUrl.includes("/storage/v1/object/")) {
        const matches = initialAvatarUrl.match(/\/avatars\/(.+)$/);
        if (matches) {
          filePath = matches[1];
        }
      }

      // Get signed URL from private bucket
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error("Error getting signed URL:", error);
        setAvatarUrl("/avatar-default.svg");
        setLoading(false);
        return;
      }

      // Cache the signed URL
      setCachedAvatar(cacheKey, data.signedUrl);
      setAvatarUrl(data.signedUrl);
    } catch (error) {
      console.error("Error fetching avatar:", error);
      setAvatarUrl("/avatar-default.svg");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
  };

  return (
    <div className='flex flex-col items-center space-y-4'>
      {loading ? (
        <Skeleton className='w-32 h-32 rounded-full' />
      ) : (
        <div className='relative w-32 h-32'>
          <Image
            src={avatarUrl || "/avatar-default.svg"}
            alt='User Avatar'
            fill
            sizes='128px'
            className='rounded-full object-cover'
            priority
          />
        </div>
      )}
      <AvatarUpload userId={userId} onAvatarChange={handleAvatarChange} />
    </div>
  );
};

export default ProfileAvatar;
