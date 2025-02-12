import React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomToast } from "@/hooks/useCustomToast";
import { sendPasswordResetEmail } from "@/app/actions/auth-actions";

const ResetPasswordForm = ({ switchMode }) => {
  const customToast = useCustomToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await sendPasswordResetEmail(data.email);
      if (result.success) {
        customToast.success("Check your email for further instructions.");
        switchMode("login");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      customToast.error("Failed to send password reset link.");
    }
  };;

  return (
    <form
      className='mt-8 space-y-6'
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {/* Email Input */}
      <div>
        <Label htmlFor='email' className='text-white text-xl mb-2'>
          Email
        </Label>
        <Input
          type='email'
          id='email'
          placeholder='you@example.com'
          className={`bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2 ${
            errors.email ? "border-red-500" : ""
          }`}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />
        {errors.email && (
          <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <Button
          type='submit'
          disabled={isSubmitting}
          className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange'
        >
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
      </div>

      {/* Back to Login Button */}
      <div className='text-center text-sm'>
        <Button
          type='button'
          onClick={() => switchMode("login")}
          variant='link'
          className='text-orange hover:text-yellow'
        >
          Back to Login
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
