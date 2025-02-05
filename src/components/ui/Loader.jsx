"use client";

import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div
      role='status'
      className='flex flex-col items-center justify-center min-h-screen bg-black'
    >
      <motion.div
        className='border-4 border-orange border-t-transparent rounded-full w-12 h-12'
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <motion.span
        className='mt-4 text-white text-lg'
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        Loading...
      </motion.span>
    </div>
  );
};

export default Loader;
