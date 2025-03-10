"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function SignupSuccessDialog({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-[#0E0E0E] border border-white/10 text-white sm:max-w-md'>
        <DialogHeader>
          <div className='mx-auto bg-orange/10 p-3 rounded-full mb-4'>
            <Mail className='h-6 w-6 text-orange' />
          </div>
          <DialogTitle className='text-xl text-center'>
            Thanks for signing up!
          </DialogTitle>
          <DialogDescription className='text-white/70 text-center'>
            We've sent a confirmation email to your inbox. Please check your
            email and follow the instructions to activate your account.
          </DialogDescription>
        </DialogHeader>
        <div className='flex justify-center mt-4'>
          <Button
            onClick={onClose}
            className='bg-orange hover:bg-yellow text-black font-semibold transition-all duration-200'
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
