"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  const inputClasses =
    "bg-[#1F1F1E] border-none text-white placeholder:text-orange/40 focus-visible:ring-1 focus-visible:ring-orange focus-visible:ring-offset-0 focus:outline-none transition-all duration-200";

  return (
    <section className='font-manrope relative '>
      <div className='container px-4 mx-auto pt-10 pb-32 md:pb-20'>
        <div className='flex flex-col md:flex-row items-start justify-between relative z-10'>
          <h2 className='text-[2.5rem] md:text-5xl font-extrabold text-white mb-14 md:mb-8 max-w-md'>
            STILL HAVE QUESTIONS OR NEED HELP?
          </h2>

          <form
            onSubmit={handleSubmit}
            className='space-y-6 max-w-md w-full rounded-[18px] bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart p-[1px]'
          >
            <div className='bg-black rounded-[17px] p-8 space-y-6 flex flex-col items-center'>
              <h3 className='text-center text-white text-xl'>
                Fill out the form below to connect with one of our wealth
                management experts.
              </h3>
              <Input
                placeholder='Telegram Name'
                className={inputClasses}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <Textarea
                placeholder='Additional Comment'
                className={inputClasses}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
              <Button
                type='submit'
                className='w-full max-w-32 bg-gradient-to-b from-gradientStart to-gradientMid text-black'
              >
                SEND
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className='absolute bottom-56 right-0 md:bottom-10  md:-right-20 h-[340px] w-[320px]  rounded-full blur-[200px] pointer-events-none bg-orange '></div>
    </section>
  );
}
