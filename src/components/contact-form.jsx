"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  const inputClasses =
    "bg-[#1F1F1E] border-none text-white placeholder:text-orange/40 focus-visible:ring-1 focus-visible:ring-orange focus-visible:ring-offset-0 focus:outline-none transition-all duration-200";

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
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className='font-manrope relative bg-transparent z-0 overflow-x-clip'
    >
      <div className='container px-4 mx-auto pt-10 pb-32 md:pb-20'>
        <div className='flex flex-col md:flex-row items-start justify-between relative z-10'>
          <motion.h2
            variants={staggerVariants}
            initial='hidden'
            animate={isInView ? "visible" : "hidden"}
            custom={0}
            className='text-[2.5rem] md:text-5xl font-extrabold text-white mb-14 md:mb-8 max-w-md'
          >
            STILL HAVE QUESTIONS OR NEED HELP?
          </motion.h2>

          <motion.form
            variants={staggerVariants}
            initial='hidden'
            animate={isInView ? "visible" : "hidden"}
            custom={1}
            onSubmit={handleSubmit}
            className='space-y-6 max-w-md w-full rounded-[18px] bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart p-[1px]'
          >
            <div className='bg-black rounded-[17px] p-8 space-y-6 flex flex-col items-center'>
              <motion.h3
                variants={staggerVariants}
                custom={2}
                className='text-center text-white text-xl'
              >
                Fill out the form below to connect with one of our wealth
                management experts.
              </motion.h3>
              <motion.div
                variants={staggerVariants}
                custom={3}
                className='w-full'
              >
                <Input
                  placeholder='Telegram Name'
                  className={inputClasses}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </motion.div>

              <motion.div
                variants={staggerVariants}
                custom={4}
                className='w-full'
              >
                <Textarea
                  placeholder='Additional Comment'
                  className={inputClasses}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </motion.div>
              <motion.div
                variants={staggerVariants}
                custom={5}
                className='w-full flex justify-center'
              >
                <Button
                  type='submit'
                  className='w-full max-w-32 bg-gradient-to-b from-gradientStart to-gradientMid text-black'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  SEND
                </Button>
              </motion.div>
            </div>
          </motion.form>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className='absolute bottom-56 right-0 md:bottom-1 md:-right-20 h-[340px] w-[320px] rounded-full blur-[200px] pointer-events-none bg-orange'
      ></motion.div>
    </motion.section>
  );
}
