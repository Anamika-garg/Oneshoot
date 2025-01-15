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

  return (
    <section className='py-20 bg-black'>
      <div className='container px-4'>
        <div className='max-w-xl mx-auto'>
          <h2 className='text-3xl font-bold text-white mb-8'>
            STILL HAVE QUESTIONS OR NEED HELP?
          </h2>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <Input
              placeholder='Your Name'
              className='bg-zinc-900 border-white/10 text-white'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              type='email'
              placeholder='Email Address'
              className='bg-zinc-900 border-white/10 text-white'
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Textarea
              placeholder='Additional Comment'
              className='bg-zinc-900 border-white/10 text-white'
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
            <Button
              type='submit'
              className='w-full bg-yellow-500 hover:bg-yellow-400 text-black'
            >
              SEND
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
