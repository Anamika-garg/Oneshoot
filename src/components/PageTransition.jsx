"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const PageTransition = ({ children }) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  const animationVariants = shouldReduceMotion ? {} : variants;

  return (
    <AnimatePresence mode='wait' initial={false} loading='eager'>
      <m.div
        key={pathname}
        variants={animationVariants}
        initial='hidden'
        animate='visible'
        className='min-h-screen'
      >
        {isLoading ? (
          <div className='flex items-center justify-center min-h-screen'>
            <div className='w-16 h-16 border-t-4 border-orange border-solid rounded-full animate-spin'></div>
          </div>
        ) : (
          children
        )}
      </m.div>
    </AnimatePresence>
  );
};

const MotionProvider = ({ children }) => (
  <LazyMotion features={domAnimation}>{children}</LazyMotion>
);

export { PageTransition, MotionProvider };
