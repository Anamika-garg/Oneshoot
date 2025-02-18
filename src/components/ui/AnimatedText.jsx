"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const AnimatedText = ({ children, index = 0, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const animation = {
    initial: { y: "100%" },
    enter: {
      y: "0",
      transition: {
        duration: 0.75,
        ease: [0.33, 1, 0.68, 1],
        delay: 0.075 * index,
      },
    },
  };

  return (
    <div ref={ref} className='overflow-hidden'>
      <motion.div
        variants={animation}
        initial='initial'
        animate={isInView ? "enter" : "initial"}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AnimatedText;
