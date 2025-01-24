"use client";

import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Card } from "@/components/ui/card";
import { Star, ChevronRight } from "lucide-react"; // Import ChevronRight for the chevron button
import clsx from "clsx"; // Utility for conditional classNames

// Sample feedback data
const feedbacks = [
  {
    text: "Vouch. Bought a personal account, quick and good customer service.",
    date: "2023-12-22",
    rating: 5,
  },
  {
    text: "Excellent experience! Highly recommend their services.",
    date: "2023-12-23",
    rating: 4,
  },
  {
    text: "Great support and reliable products.",
    date: "2023-12-24",
    rating: 5,
  },
  {
    text: "Satisfied with the purchase. Will come back for more.",
    date: "2023-12-25",
    rating: 4,
  },
];

function Feedback() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
    dragFree: true,
  });

  const [isMobile, setIsMobile] = useState(false);

  // Handler to update `isMobile` based on window width
  const handleResize = useCallback(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' breakpoint is 640px
    }
  }, []);

  useEffect(() => {
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Optional: Adjust Embla options based on `isMobile`
  // For simplicity, we're handling slide widths via CSS

  // Handler for chevron button click
  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  return (
    <section className="font-manrope py-16 relative">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
          <h2 className="text-4xl font-bold text-white tracking-wider uppercase">
            Feedbacks
          </h2>
          <p className="text-xl font-manrope uppercase font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent">
            What People are saying about us
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {feedbacks.map((feedback, index) => (
                <div
                  key={index}
                  className={clsx(
                    "flex-shrink-0 min-w-0",
                    isMobile ? "w-full" : "flex-[0_0_330px]"
                  )}
                >
                  <Card className="p-6 bg-black border-none max-w-80 h-full">
                    <div className="text-8xl font-semibold bg-gradient-to-b md:bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent font-montserrat mb-2">
                      “
                    </div>
                    <p className="text-white mb-6 text-base">{feedback.text}</p>
                    <time className="block text-white/60 mb-6">
                      {feedback.date}
                    </time>
                    <div className="flex gap-1">
                      {Array.from({ length: feedback.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-current text-yellow"
                        />
                      ))}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Chevron Button - Visible only on Mobile */}
          {isMobile && (
            <button
              onClick={scrollNext}
              className="absolute top-1/2 -translate-y-1/2 right-4 bg-transparent p-2 rounded-full shadow-lg  focus:outline-none "
              aria-label="Next Slide"
            >
              <ChevronRight className="w-8 h-8 text-orange" />
            </button>
          )}
        </div>
      </div>

      {/* Decorative Blur Element */}
      <div className="absolute -bottom-32 -left-72 md:-left-40 h-[320px] w-[320px] rounded-full blur-[200px] opacity-70 pointer-events-none bg-orange"></div>
    </section>
  );
}

export default Feedback;