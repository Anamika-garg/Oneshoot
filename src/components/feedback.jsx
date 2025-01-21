"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

// Sample feedback data
const feedbacks = [
  {
    text: "Vouch. Bought an personal account, quick and good customer service.",
    date: "2023-12-22 00:00:00",
    rating: 5,
  },
  {
    text: "Vouch. Bought an personal account, quick and good customer service.",
    date: "2023-12-22 00:00:00",
    rating: 5,
  },
  {
    text: "Vouch. Bought an personal account, quick and good customer service.",
    date: "2023-12-22 00:00:00",
    rating: 5,
  },
  {
    text: "Vouch. Bought an personal account, quick and good customer service.",
    date: "2023-12-22 00:00:00",
    rating: 5,
  },
];

function Feedback() {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
    dragFree: true,
  });

  return (
    <section className='font-manrope  py-16 relative'>
      <div className='container px-4 mx-auto'>
        <div className='flex items-center gap-8 mb-12'>
          <h2 className='text-4xl font-bold text-white tracking-wider uppercase'>
            Feedbacks
          </h2>
          <p className='text-xl font-manrope uppercase font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
            What People are saying about us
          </p>
        </div>

        <div className='overflow-hidden' ref={emblaRef}>
          <div className='flex gap-6'>
            {feedbacks.map((feedback, index) => (
              <div key={index} className='flex-[0_0_330px] min-w-0'>
                <Card className='p-6 bg-black border-none max-w-80'>
                  <div className='text-8xl font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent font-montserrat mb-2'>
                    “
                  </div>
                  <p className='text-white mb-6 text-base'>{feedback.text}</p>
                  <time className='block text-white/60 mb-6'>
                    {feedback.date}
                  </time>
                  <div className='flex gap-3'>
                    {Array.from({ length: feedback.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className='w-5 h-5 fill-yellow text-yellow'
                      />
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='absolute -bottom-20  -left-40 h-[320px] w-[320px]  rounded-full blur-[200px] opacity-70 pointer-events-none bg-orange'></div>
    </section>
  );
}

export default Feedback;
