"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import ResetPasswordForm from "./ResetPasswordForm";
import { Button } from "@/components/ui/button";

const cardVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, delay: 0.3 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const AuthForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") || "login";
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    const currentMode = searchParams.get("mode");
    if (currentMode && currentMode !== mode) {
      setMode(currentMode);
    }
  }, [searchParams, mode]);

  const switchMode = (newMode) => {
    setMode(newMode);
    router.push(`/login?mode=${newMode}`);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-black px-4 font-manrope relative overflow-hidden'>
      {/* Background Gradient */}
      <div className='absolute right-0 -translate-x-14 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart w-[440px] h-[440px] rounded-full blur-[300px] opacity-80' />

      {/* Auth Form Container */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={mode}
          variants={cardVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          className='w-full max-w-md bg-[#0E0E0E] p-8 rounded-2xl relative z-10'
        >
          {/* Dynamic Header Section */}
          <div>
            {/* Title */}
            <h1 className='mt-2 text-center text-5xl font-extrabold text-white uppercase'>
              {mode === "reset"
                ? "Reset Your Password"
                : mode === "login"
                  ? "Sign In"
                  : "Sign Up"}
            </h1>

            {/* Subtitle for Reset Password */}
            {mode === "reset" && (
              <p className='text-center text-white/75 mt-2'>
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            )}

            {/* Additional Text and Navigation Buttons */}
            <div className='text-center text-base mt-4'>
              {mode === "login" && (
                <div className='flex items-center justify-center gap-2'>
                  <p className='text-white/55'>Don't have an account?</p>
                  <Button
                    onClick={() => switchMode("signup")}
                    variant='link'
                    className='text-orange hover:text-yellow p-0 bg-transparent hover:bg-transparent hover:no-underline'
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {mode === "signup" && (
                <div className='flex items-center justify-center gap-2'>
                  <p className='text-white/55'>Already have an account?</p>
                  <Button
                    onClick={() => switchMode("login")}
                    variant='link'
                    className='text-orange hover:text-yellow p-0 bg-transparent hover:bg-transparent hover:no-underline'
                  >
                    Sign In
                  </Button>
                </div>
              )}

              {mode === "reset" && (
                <div className='flex items-center justify-center gap-2'>
                  <p className='text-white/55'>Remembered your password?</p>
                  <Button
                    onClick={() => switchMode("login")}
                    variant='link'
                    className='text-orange hover:text-yellow p-0 bg-transparent hover:bg-transparent hover:no-underline'
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Render the appropriate form based on the mode */}
          <div className='mt-8'>
            {mode === "login" && <LoginForm switchMode={switchMode} />}
            {mode === "signup" && <SignUpForm switchMode={switchMode} />}
            {mode === "reset" && <ResetPasswordForm switchMode={switchMode} />}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthForm;
