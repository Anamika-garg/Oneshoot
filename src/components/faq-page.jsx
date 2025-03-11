"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { FadeInWhenVisible } from "./ui/FadeInWhenVisible";

const faqData = [
  {
    question: "How long does it take for the account to be delivered?",
    answer:
      "Delivery of accounts occurs within 1-24 hours on your email adress in .zip format, in rare cases it may take longer. The maximum waiting period is 4 days",
  },
  {
    question:
      "I need an account with a custom name or other data, can you do it?",
    answer:
      "Yes, for this you need to write to our manager in telegram, he will answer all questions, the price and waiting period may increase.",
  },
  {
    question: "What guarantees do I get when I purchase an account?",
    answer:
      "If the account is blocked within 24 hours and there were no data changes or transaction attempts on the account, then we will replace the account within a few days.(only 1 replacement for 1 account). If any emulator was used to transfer the account, we are not responsible for blocking. Refunds are available only after the maximum waiting time (4 days) has expired; refunds do not apply to other cases. If the account was stolen after 5 days (120 hours after receiving the account), we are not responsible for this. If the account requested any additional verifications, documents, statements, etc. - write to our manager, we will resolve this issue for an additional fee.",
  },
  {
    question: "Can I use a guarantor to purchase?",
    answer:
      "If you want to use a guarantor service to purchase an account, write to our manager.",
  },
];

const AccordionItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className='border-b border-white/10'>
      <button
        className='flex w-full items-center justify-between py-4 text-left'
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`content-${item.question}`}
      >
        <span className='text-xl font-normal text-white'>{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className='flex items-center justify-center'
        >
          <Plus className='h-6 w-6 text-white' />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`content-${item.question}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden'
          >
            <div className='pb-4 text-white/80'>{item.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className='relative  bg-black px-4 py-20 mb-14'>
      <div className='container relative z-20 mx-auto'>
        <FadeInWhenVisible>
          <h1 className='mb-12 text-center text-[2.5rem] md:text-5xl font-bold text-white'>
            FAQ
          </h1>
        </FadeInWhenVisible>
        <div className='space-y-1'>
          {faqData.map((item, index) => (
            <FadeInWhenVisible key={index} delay={index * 0.1}>
              <AccordionItem
                item={item}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
      <div className='absolute top-16  -right-20 md:right-24 h-80 md:h-[220px] w-80 md:w-[220px] rounded-full blur-[220px] md:blur-[200px] pointer-events-none bg-orange'></div>
    </section>
  );
}
