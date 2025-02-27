"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import UpdatePasswordForm from "../security/UpdatePasswordForm";
import UpdateEmailForm from "../security/UpdateEmailForm";
import { FadeInWhenVisible } from "../ui/FadeInWhenVisible";

const SecurityTab = ({ currentEmail }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <FadeInWhenVisible>
      <motion.div
        variants={container}
        initial='hidden'
        animate='show'
        className='grid grid-cols-1 mt-10 md:grid-cols-3 gap-6'
      >
        <motion.div variants={item} className='md:col-span-2'>
          <Card className='bg-lightBlack border-none h-full'>
            <CardContent className='p-6 bg-lightBlack rounded-lg h-full flex flex-col'>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className='text-2xl font-semibold mb-6 text-white'
              >
                Update Email
              </motion.h2>
              <div className='flex-grow flex flex-col'>
                <UpdateEmailForm currentEmail={currentEmail} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className='md:col-span-1'>
          <Card className='bg-lightBlack border-none h-full'>
            <CardContent className='p-6 bg-lightBlack rounded-lg h-full flex flex-col'>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className='text-2xl font-semibold mb-6 text-white'
              >
                Change Password
              </motion.h2>
              <div className='flex-grow flex flex-col'>
                <UpdatePasswordForm />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </FadeInWhenVisible>
  );
};

export default SecurityTab;
