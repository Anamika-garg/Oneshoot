"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NavigationObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Function to update navbar position based on banner
    const updateNavbarPosition = () => {
      const bannerHeight = Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--promo-banner-height"
        ) || "0"
      );

      if (bannerHeight > 0) {
        const navbar = document.querySelector("nav.fixed");
        if (navbar) {
          navbar.style.top = `${bannerHeight}px`;
        }
      }
    };

    // Run on route change with a delay to ensure DOM is updated
    setTimeout(updateNavbarPosition, 100);

    // Also run it a bit later to catch any delayed renders
    setTimeout(updateNavbarPosition, 500);
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
