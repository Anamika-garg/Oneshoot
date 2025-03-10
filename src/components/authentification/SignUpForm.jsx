"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useCustomToast } from "@/hooks/useCustomToast";
import { signup } from "@/app/actions/auth-actions";
import { SignupSuccessDialog } from "./components/sign-up-dialog";

const SignUpForm = ({ switchMode }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const customToast = useCustomToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("name", data.name);

      const { success, error } = await signup(formData);

      if (!success) {
        throw new Error(error || "Sign-up failed");
      }

      customToast.success("Sign-up successful!");
      reset(); // Reset the form

      // Show success dialog instead of immediately switching to login
      setShowSuccessDialog(true);
    } catch (error) {
      customToast.error(error.message || "Sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowSuccessDialog(false);
    // Switch to login mode after closing the dialog
    switchMode("login");
  };

  return (
    <>
      <form
        className='mt-8 space-y-6'
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Name Field */}
        <div>
          <Label htmlFor='name' className='text-white text-xl mb-2'>
            Name
          </Label>
          <Input
            id='name'
            type='text'
            placeholder='John Doe'
            className='bg-[#0E0E0E] border border-white/10 text-white focus:border-orange transition-all duration-200 mt-2 outline-none'
            aria-invalid={errors.name ? "true" : "false"}
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters long",
              },
              maxLength: {
                value: 50,
                message: "Name must not exceed 50 characters",
              },
            })}
          />
          {errors.name && (
            <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <Label htmlFor='email' className='text-white text-xl mb-2'>
            Email
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='you@example.com'
            className='bg-[#0E0E0E] border border-white/10 text-white focus:border-orange transition-all duration-200 mt-2 outline-none'
            aria-invalid={errors.email ? "true" : "false"}
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

        {/* Password Field */}
        <div>
          <Label htmlFor='password' className='text-white text-xl mb-2'>
            Password
          </Label>
          <Input
            id='password'
            type='password'
            placeholder='********'
            className='bg-[#0E0E0E] border border-white/10 text-white focus:border-orange transition-all duration-200 mt-2 outline-none'
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              },
            })}
          />
          {errors.password && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <Label htmlFor='confirmPassword' className='text-white text-xl mb-2'>
            Confirm Password
          </Label>
          <Input
            id='confirmPassword'
            type='password'
            placeholder='********'
            className='bg-[#0E0E0E] border border-white/10 text-white focus:border-orange transition-all duration-200 mt-2 outline-none'
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className='space-y-3'>
          <Button
            type='submit'
            className='w-full flex justify-center py-2 px-4 border border-transparent text-base font-semibold rounded-md text-black bg-orange hover:bg-yellow focus:outline-none transition-all duration-200'
            disabled={loading}
          >
            {loading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              "Sign Up"
            )}
          </Button>
        </div>

        {/* Email Confirmation Instructions */}
        <p className='text-white/50 text-sm text-center mt-4'>
          If you don't receive a confirmation email, please fill out the form
          again.
        </p>
      </form>

      {/* Success Dialog */}
      <SignupSuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default SignUpForm;
