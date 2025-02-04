"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function UpdatePasswordForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const supabase = createClient();

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
        // If you want to require the current password, you'll need to handle re-authentication
        // Supabase does not support sending the current password in the updateUser method
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully.");
      reset();
    } catch (error) {
      toast.error(
        error.message || "An error occurred while updating the password"
      );
      console.error("Password Update Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex flex-col space-y-4 text-white h-full'
    >
      <div>
        <Label htmlFor='newPassword'>New Password</Label>
        <Input
          id='newPassword'
          type='password'
          className='bg-lightBlack border-white/10 text-white focus:outline-none transition-all duration-200 mt-2'
          {...register("newPassword", {
            required: "New password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
          })}
        />
        {errors.newPassword && (
          <p className='text-red-500 text-sm mt-1'>
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm New Password Field */}
      <div>
        <Label htmlFor='confirmPassword'>Confirm New Password</Label>
        <Input
          id='confirmPassword'
          type='password'
          className='bg-lightBlack border-white/10 text-white focus:outline-none transition-all duration-200 mt-2'
          {...register("confirmPassword", {
            required: "Please confirm your new password",
            validate: (value) =>
              value === newPassword || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p className='text-red-500 text-sm mt-1'>
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Spacer to push the button to the bottom */}
      <div className='flex-grow'></div>

      {/* Submit Button */}
      <Button
        type='submit'
        disabled={loading}
        className='w-full bg-orange hover:bg-orange/90 mt-4  text-black'
      >
        {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Update Password
      </Button>
    </form>
  );
}
