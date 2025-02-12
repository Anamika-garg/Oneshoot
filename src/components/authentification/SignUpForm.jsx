import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useCustomToast } from "@/hooks/useCustomToast";
import { signup } from "@/app/actions/auth-actions";
import { redirect } from "next/navigation";

const SignUpForm = ({ switchMode }) => {
  const [loading, setLoading] = useState(false);
  const customToast = useCustomToast();

  const {
    register,
    handleSubmit,
    watch,
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

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("name", data.name);

    const { success, error } = await signup(formData);

    if (!success) {
      customToast.error("Sign-up failed.");
      setLoading(false);
    } else {
      customToast.success("Sign-up successful!");
      // Redirect after toast is shown
      setTimeout(() => redirect("/login"), 1000); // Delay redirect to allow toast to display
    }
  };

  return (
    <form
      className='mt-8 space-y-6'
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className='rounded-md shadow-sm space-y-4'>
        {/* Name Field */}
        <div>
          <Label htmlFor='name' className='text-white text-xl mb-2'>
            Name
          </Label>
          <Input
            id='name'
            type='text'
            placeholder='John Doe'
            className={`bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2 ${
              errors.name ? "border-red-500" : ""
            }`}
            aria-invalid={errors.name ? "true" : "false"}
            {...register("name", {
              required: "Name is required",
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
            className={`bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2 ${
              errors.email ? "border-red-500" : ""
            }`}
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
            className={`bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2 ${
              errors.password ? "border-red-500" : ""
            }`}
            aria-invalid={errors.password ? "true" : "false"}
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

        {/* Confirm Password Field */}
        <div>
          <Label htmlFor='confirmPassword' className='text-white text-xl mb-2'>
            Confirm Password
          </Label>
          <Input
            id='confirmPassword'
            type='password'
            placeholder='********'
            className={`bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2 ${
              errors.confirmPassword ? "border-red-500" : ""
            }`}
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
      </div>

      {/* Submit Button */}
      <div className='space-y-3'>
        <Button
          type='submit'
          className='w-full flex justify-center py-2 px-4 border border-transparent text-base font-semibold rounded-md text-black bg-orange hover:bg-yellow focus:outline-none transition-all duration-200'
          disabled={loading}
        >
          {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Sign Up
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
