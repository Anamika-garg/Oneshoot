"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Keys for localStorage
const PROMO_EXPIRY_KEY = "promoExpiry";
const PROMO_DISMISSED_KEY = "promoDismissed";
const PROMO_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
// Create a global CSS variable to track banner height
const CSS_VAR = "--promo-banner-height";

const PromoBanner = ({ createdAt }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const bannerRef = useRef(null);
  const timerRef = useRef(null);
  const pathname = usePathname(); // Track route changes

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user is new (registered within 7 days)
    const userCreationDate = new Date(createdAt);
    const isNewUser =
      (Date.now() - userCreationDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;

    if (!isNewUser) return;

    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem(PROMO_DISMISSED_KEY) === "true";
    if (isDismissed) return;

    // Get or set expiration timestamp
    let expiryTimestamp = Number.parseInt(
      localStorage.getItem(PROMO_EXPIRY_KEY),
      10
    );

    // If no expiry timestamp exists or it's invalid, set a new one
    if (!expiryTimestamp || isNaN(expiryTimestamp)) {
      expiryTimestamp = Date.now() + PROMO_DURATION_MS;
      localStorage.setItem(PROMO_EXPIRY_KEY, expiryTimestamp.toString());
    }

    // Check if promo has expired
    if (Date.now() >= expiryTimestamp) {
      localStorage.removeItem(PROMO_EXPIRY_KEY);
      return;
    }

    // Show banner and start countdown
    setIsVisible(true);

    // Update timer function
    const updateTimer = () => {
      const now = Date.now();
      const timeRemaining = Math.max(0, expiryTimestamp - now);

      if (timeRemaining <= 0) {
        clearInterval(timerRef.current);
        setIsVisible(false);
        localStorage.removeItem(PROMO_EXPIRY_KEY);
        return;
      }

      // Calculate hours, minutes, seconds
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    // Initial update
    updateTimer();

    // Set interval for countdown
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [createdAt]);

  // Update CSS variable and add class to body when banner is visible
  useEffect(() => {
    if (!isVisible) {
      document.documentElement.style.removeProperty(CSS_VAR);
      document.body.classList.remove("has-promo-banner");
      return;
    }

    const updateBannerHeight = () => {
      if (bannerRef.current) {
        const height = bannerRef.current.offsetHeight;
        document.documentElement.style.setProperty(CSS_VAR, `${height}px`);
        document.body.classList.add("has-promo-banner");

        // Force navbar update
        const navbar = document.querySelector("nav.fixed");
        if (navbar) {
          navbar.style.top = `${height}px`;
        }
      }
    };

    // Initial update with a slight delay to ensure rendering
    setTimeout(updateBannerHeight, 50);

    // Update on resize
    window.addEventListener("resize", updateBannerHeight);

    // Create and inject global styles for the navbar
    const styleEl = document.createElement("style");
    styleEl.id = "promo-banner-styles";
    styleEl.innerHTML = `
      body.has-promo-banner nav.fixed {
        top: var(${CSS_VAR}, 0px) !important;
        transition: top 0.3s ease;
      }
      
      body.has-promo-banner main {
        padding-top: var(${CSS_VAR}, 0px);
      }
    `;

    // Only append if not already present
    if (!document.getElementById("promo-banner-styles")) {
      document.head.appendChild(styleEl);
    }

    return () => {
      window.removeEventListener("resize", updateBannerHeight);
      const existingStyle = document.getElementById("promo-banner-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
      document.documentElement.style.removeProperty(CSS_VAR);
      document.body.classList.remove("has-promo-banner");

      // Reset navbar position
      const navbar = document.querySelector("nav.fixed");
      if (navbar) {
        navbar.style.top = "0";
      }
    };
  }, [isVisible]);

  // Recalculate on route change
  useEffect(() => {
    if (!isVisible || !bannerRef.current) return;

    const recalculateAfterNavigation = () => {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const height = bannerRef.current?.offsetHeight || 0;
        document.documentElement.style.setProperty(CSS_VAR, `${height}px`);

        // Force navbar update
        const navbar = document.querySelector("nav.fixed");
        if (navbar) {
          navbar.style.top = `${height}px`;
        }
      }, 100);
    };

    recalculateAfterNavigation();
  }, [pathname, isVisible]); // Re-run when pathname changes

  if (!isVisible) return null;

  const formatTime = (value) => value.toString().padStart(2, "0");

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(PROMO_DISMISSED_KEY, "true");
    localStorage.removeItem(PROMO_EXPIRY_KEY);
  };

  return (
    <Alert
      ref={bannerRef}
      className='fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-500 to-orange border-none text-black py-2 shadow-md'
    >
      <div className='flex flex-col md:flex-row md:items-center justify-between w-full max-w-7xl mx-auto px-4'>
        <div className='flex items-center gap-2'>
          <AlertCircle className='h-4 w-4' />
          <div>
            <AlertTitle className='text-black font-bold text-sm'>
              Special Offer for New Users!
            </AlertTitle>
            <AlertDescription className='text-black text-xs'>
              Place any order and get a 10% discount using the promo code{" "}
              <span className='font-bold text-black'>ONESHOT</span>
            </AlertDescription>
          </div>
        </div>
        <div className='flex items-center mt-1 md:mt-0'>
          <div className='bg-white/20 px-2 py-0.5 rounded-md text-black font-mono text-xs'>
            {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
            {formatTime(timeLeft.seconds)} left
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='ml-1 text-black hover:bg-white/20 hover:text-white h-7 text-xs'
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default PromoBanner;
