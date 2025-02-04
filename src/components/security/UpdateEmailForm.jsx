"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateEmail } from "@/app/actions/user-actions";
import { Loader2 } from "lucide-react";

export default function UpdateEmailForm({ currentEmail }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await updateEmail(formData);

      if (result.success) {
        toast.success(result.message);
        reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while updating email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col space-y-4 text-white h-full'>
      <div>
        <Label htmlFor='currentEmail'>Current Email</Label>
        <Input
          id='currentEmail'
          type='email'
          value={currentEmail}
          disabled
          className='bg-[#0E0E0E] border-white/10 focus:outline-none transition-all duration-200 mt-2 text-gray-400'
        />
      </div>

      <div>
        <Label htmlFor='email'>New Email</Label>
        <Input
          id='email'
          type='email'
          className='bg-[#0E0E0E] border-white/10 text-white focus:outline-none transition-all duration-200 mt-2'
          {...register("email", {
            required: "New email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          })}
        />
        {errors.email && (
          <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor='password'>Current Password (for verification)</Label>
        <Input
          id='password'
          type='password'
          className='bg-[#0E0E0E] border-white/10 text-white focus:outline-none transition-all duration-200 mt-2'
          {...register("password", {
            required: "Password is required for verification",
          })}
        />
        {errors.password && (
          <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>
        )}
      </div>

      {/* Spacer to push the button to the bottom */}
      <div className='flex-grow'></div>

      <Button
        type='submit'
        disabled={loading}
        className='w-full bg-orange hover:bg-orange/90 mt-4 text-black'
      >
        {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Update Email
      </Button>
    </form>
  );
}