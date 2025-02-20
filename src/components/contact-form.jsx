"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCustomToast } from "@/hooks/useCustomToast";
import { ArrowRight, Loader2 } from "lucide-react";

// Define the validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^@/, "Telegram name must start with @")
    .max(32, "Name must be less than 32 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
});

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      message: "",
    },
  });

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const customToast = useCustomToast();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        customToast.success("Your message has been sent successfully!");
        reset();
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      customToast.error("Failed to send your message. Please try again later.");
    }
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
        <div className='flex flex-col md:flex-row items-start justify-between relative z-50'>
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
            onSubmit={handleSubmit(onSubmit)}
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
                  {...register("name")}
                />
                {errors.name && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.name.message}
                  </p>
                )}
              </motion.div>

              <motion.div
                variants={staggerVariants}
                custom={4}
                className='w-full'
              >
                <Textarea
                  placeholder='Additional Comment'
                  className={inputClasses}
                  {...register("message")}
                />
                {errors.message && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.message.message}
                  </p>
                )}
              </motion.div>
              <motion.div
                variants={staggerVariants}
                custom={5}
                className='w-full flex justify-center'
              >
                <motion.button
                  type='submit'
                  className='w-full max-w-32 text-black h-10 px-4 py-2 inline-flex items-center justify-center uppercase gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                  style={{
                    background:
                      "linear-gradient(to bottom, var(--gradient-start), var(--gradient-mid))",
                  }}
                  initial={{
                    "--gradient-start": "#FFDD55",
                    "--gradient-mid": "#FFA500",
                  }}
                  whileHover={{
                    "--gradient-start": "#FFA500",
                    "--gradient-mid": "#FFDD55",
                    transition: { duration: 0.2, ease: "easeInOut" },
                  }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Submit
                </motion.button>
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
