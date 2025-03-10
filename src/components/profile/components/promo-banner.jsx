"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PROMO_KEY = "promoTimer";
const INITIAL_TIME = { hours: 11, minutes: 59, seconds: 0 };

const PromoBanner = ({ createdAt }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userCreationDate = new Date(createdAt);
    const isNewUser =
      (Date.now() - userCreationDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    if (!isNewUser) return;

    setIsVisible(true);
    const storedTime =
      JSON.parse(localStorage.getItem(PROMO_KEY)) || INITIAL_TIME;
    setTimeLeft(storedTime);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev) return INITIAL_TIME;
        const { hours, minutes, seconds } = prev;

        if (hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(timerRef.current);
          setIsVisible(false);
          localStorage.removeItem(PROMO_KEY);
          return INITIAL_TIME;
        }

        const updatedTime =
          seconds > 0
            ? { ...prev, seconds: seconds - 1 }
            : minutes > 0
              ? { hours, minutes: minutes - 1, seconds: 59 }
              : { hours: hours - 1, minutes: 59, seconds: 59 };

        localStorage.setItem(PROMO_KEY, JSON.stringify(updatedTime));
        return updatedTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [createdAt]);

  if (!isVisible) return null;

  const formatTime = (value) => value.toString().padStart(2, "0");

  return (
    <Alert className='fixed top-20 z-50 bg-gradient-to-r from-amber-500 to-orange border-none text-black mb-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between w-full'>
        <div className='flex items-center gap-4'>
          <AlertCircle className='h-6 w-6' />
          <div>
            <AlertTitle className='text-black font-bold'>
              Special Offer for New Users!
            </AlertTitle>
            <AlertDescription className='text-black'>
              Place any order and get a 10% discount using the promo code{" "}
              <span className='font-bold text-black'>ONESHOT</span>
            </AlertDescription>
          </div>
        </div>
        <div className='flex items-center mt-2 md:mt-0'>
          <div className='bg-white/20 px-3 py-1 rounded-md text-black font-mono'>
            {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
            {formatTime(timeLeft.seconds)} left
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='ml-2 text-black hover:bg-white/20 hover:text-white'
            onClick={() => {
              setIsVisible(false);
              localStorage.removeItem(PROMO_KEY);
            }}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default PromoBanner;
