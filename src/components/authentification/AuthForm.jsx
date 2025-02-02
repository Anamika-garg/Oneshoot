"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import ResetPasswordForm from "./ResetPasswordForm";
import { Button } from "../ui/button";

const AuthForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") || "login";
  const [mode, setMode] = useState(initialMode);

  // Update mode if the query parameter changes
  useEffect(() => {
    const currentMode = searchParams.get("mode");
    if (currentMode && currentMode !== mode) {
      setMode(currentMode);
    }
  }, [searchParams, mode]);

  // Function to switch modes and update the URL
  const switchMode = (newMode) => {
    setMode(newMode);
    router.push(`/login?mode=${newMode}`);
  };

  return (
    <motion.div
      className='min-h-screen flex items-center justify-center bg-black px-4 font-manrope relative'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Gradient */}
      <div className='absolute right-0 -translate-x-14 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart w-[440px] h-[440px] rounded-full blur-[300px] opacity-80' />

      {/* Auth Form Container */}
      <motion.div
        className='max-w-md w-full space-y-8 bg-[#0E0E0E] p-8 rounded-2xl relative z-10'
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
                {/* Additional Sign Up Text */}
                <p className='text-white/55'>Don't have an account?</p>

                {/* Navigation to Sign Up */}
                <Button
                  onClick={() => switchMode("signup")}
                  variant={"link"}
                  className='text-orange hover:text-yellow p-0 bg-transparent hover:bg-transparent hover:no-underline'
                >
                  Sign Up
                </Button>
              </div>
            )}

            {mode === "signup" && (
              <div className='flex items-center justify-center gap-2'>
                {/* Navigation to Login */}
                <p className='text-white/55'>Already have an account?</p>
                <Button
                  onClick={() => switchMode("login")}
                  variant={"link"}
                  className='text-orange hover:text-yellow p-0 bg-transparent hover:bg-transparent hover:no-underline'
                >
                  Sign In
                </Button>
              </div>
            )}

            {mode === "reset" && (
              <div className='flex items-center justify-center gap-2'>
                {/* Navigation to Login */}
                <p className='text-white/55'>Remembered your password?</p>
                <Button
                  onClick={() => switchMode("login")}
                  variant={"link"}
                  className='text-orange hover:text-yellow p-0 bg-transparent hover:bg-transparent hover:no-underline'
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Render the appropriate form based on the mode */}
        {mode === "signup" ? (
          <SignUpForm switchMode={switchMode} />
        ) : (
          <LoginForm switchMode={switchMode} />
        )}

        {mode === "reset" && <ResetPasswordForm switchMode={switchMode} />}
      </motion.div>
    </motion.div>
  );
};

export default AuthForm;
