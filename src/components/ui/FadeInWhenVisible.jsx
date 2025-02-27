"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export const FadeInWhenVisible = ({ children, delay = 0, ...props }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 12,
      }}
      className={props.className}
    >
      {children}
    </motion.div>
  );
};
