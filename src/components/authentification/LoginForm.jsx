"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/actions/auth-actions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useCustomToast } from "@/hooks/useCustomToast";

const supabase = createClient();

function LoginForm({ switchMode }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const customToast = useCustomToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const { success, error, user, session } = await login(formData);

      if (!success) {
        customToast.error(
          "Login failed. Please check your credentials and try again."
        );
        setLoading(false);
        return;
      }

      // Set the session in the client-side Supabase instance
      if (session) {
        await supabase.auth.setSession(session);
      }

      // Update React Query cache
      queryClient.setQueryData(["user"], user);

      customToast.success("Signed in successfully!");
      router.refresh(); // Force a router refresh
      setTimeout(() => router.push("/account"), 500);
    } catch (error) {
      customToast.error(
        "An unexpected error occurred during login. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className='mt-8 space-y-6'
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className='rounded-md shadow-sm space-y-4'>
        {/* Email Field */}
        <div>
          <Label htmlFor='email' className='text-white text-xl mb-2'>
            Email
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='you@example.com'
            className={`bg-lightBlack border-white/10 text-white focus:border-orange outline-none transition-all duration-200 mt-2 ${
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

        {/* Password Field */}
        <div>
          <Label htmlFor='password' className='text-white text-xl mb-2'>
            Password
          </Label>
          <Input
            id='password'
            type='password'
            placeholder='********'
            className={`bg-lightBlack border-white/10 text-white focus:border-orange transition-all duration-200 mt-2 ${
              errors.password ? "border-red-500" : ""
            }`}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long",
              },
            })}
          />
          {errors.password && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {/* Forgot Password Button */}
      <div className='flex items-center justify-center'>
        <Button
          type='button'
          onClick={() => switchMode("reset")}
          variant={"link"}
          className='text-sm text-white/55 hover:text-orange text-center mx-auto transition-colors duration-200 p-0 bg-transparent hover:bg-transparent hover:no-underline'
        >
          Forgot your password?
        </Button>
      </div>

      {/* Submit Button */}
      <div className='space-y-3'>
        <Button
          type='submit'
          className='w-full flex justify-center py-2 px-4 border border-transparent text-base font-semibold rounded-md text-black bg-orange hover:bg-yellow focus:outline-none transition-all duration-200'
          disabled={loading}
        >
          {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Login
        </Button>
      </div>
    </form>
  );
}

export default LoginForm;
