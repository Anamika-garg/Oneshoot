"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useInView } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Card } from "@/components/ui/card";
import { Star, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { FadeInWhenVisible } from "./ui/FadeInWhenVisible";

const feedbacks = [
  {
    text: "Thank you for the work, everything was done in the best possible way, I will definitely contact you again",
    date: "2024-12-22",
    rating: 5,
  },
  {
    text: "I ordered an Italian bank, everything was done quickly, clearly, I recommend it to everyone",
    date: "2024-02-11",
    rating: 4,
  },
  {
    text: "Just bought an account from him yesterday. Quick response and account quality is high. A++++ support+quality. Recommended!",
    date: "2024-10-25",
    rating: 5,
  },
  {
    text: "Обратился, довольно быстро сделал контору. Все ок!",
    date: "2024-08-14",
    rating: 4,
  },
  {
    text: "Работал с человеком. Все четко, вовремя и по делу. Были сложности с продлением номера, помог в нурочное время. Рекомендую к работе.",
    date: "2024-07-28",
    rating: 5,
  },
  {
    text: "все супер, взял готовый еу банк. на все вопросы ответил. помог с настройкой. дружелюбный человек. рекомендую +rep",
    date: "2024-05-08",
    rating: 5,
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
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const handleResize = useCallback(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 640);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const staggerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <section className='font-manrope py-16 relative'>
      <div className='max-w-[1400px] px-4 mx-auto'>
        <div className='flex flex-col sm:flex-row items-center gap-8 mb-12'>
          <FadeInWhenVisible>
            <h2 className='text-4xl font-bold text-white tracking-wider uppercase'>
              Feedbacks
            </h2>
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.1}>
            <p className='text-xl font-manrope uppercase font-semibold bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent'>
              What People are saying about us
            </p>
          </FadeInWhenVisible>
        </div>

        <div className='relative'>
          <div className='overflow-hidden' ref={emblaRef}>
            <div className='flex gap-6'>
              {feedbacks.map((feedback, index) => (
                <FadeInWhenVisible
                  className={clsx(
                    "flex-shrink-0 min-w-0 relative z-50",
                    isMobile ? "w-full" : "flex-[0_0_330px]"
                  )}
                  key={index}
                  delay={0.2 + index * 0.1}
                >
                  <Card className='p-6 bg-black border-none max-w-80 h-full flex flex-col relative z-50'>
                    <div className='text-8xl font-semibold bg-gradient-to-b md:bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent font-montserrat mb-2'>
                      “
                    </div>
                    <p className='text-white mb-6 text-base flex-grow'>
                      {feedback.text}
                    </p>
                    <div className='mt-auto'>
                      <time className='block text-white/60 mb-2'>
                        {feedback.date}
                      </time>
                      <div className='flex gap-1 mt-8'>
                        {Array.from({ length: feedback.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className='w-5 h-5 fill-current text-yellow'
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>

          {isMobile && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollNext}
              className='absolute top-1/2 -translate-y-1/2 right-4 bg-transparent p-2 rounded-full shadow-lg focus:outline-none'
              aria-label='Next Slide'
            >
              <ChevronRight className='w-8 h-8 text-orange' />
            </motion.button>
          )}
        </div>
      </div>

      <div className='absolute -bottom-32 -left-72 md:-left-40 h-[320px] w-[320px] rounded-full blur-[200px] opacity-70 pointer-events-none bg-orange z-0' />
    </section>
  );
}

export default Feedback;
