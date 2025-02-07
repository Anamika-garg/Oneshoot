import { ContactForm } from "@/components/contact-form";
import FAQPage from "@/components/faq-page";
import React from "react";

const FAQ = () => {
  return (
    <main className='pt-24 font-manrope overflow-x-clip'>
      <FAQPage />
      <ContactForm />
    </main>
  );
};

export default FAQ;
