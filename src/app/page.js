"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { Stats } from "@/components/stats";
import { ContactForm } from "@/components/contact-form";
import Hero from "@/components/hero";
import Feedback from "@/components/feedback";

export default function Home() {
  const searchParams = useSearchParams();
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (searchParams.get("scroll") === "feedback") {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams]);

  return (
    <div className='min-h-screen '>
      <main className='overflow-x-clip'>
        <Hero />
        <ProductGrid />
        <Stats />
        <div id='feedback-section' ref={feedbackRef}>
          <Feedback />
        </div>
        <ContactForm />
      </main>
    </div>
  );
}
