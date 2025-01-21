"use client";

import { useState } from "react";

import toast from "react-hot-toast";
import Link from "next/link";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      toast.success("Check your email for the password reset link!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-black px-4'>
      <div className='max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-lg'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-white'>
            Reset your password
          </h2>
          <p className='mt-2 text-center text-sm text-gray-400'>
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleResetPassword}>
          <div>
            <input
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-zinc-800 text-white rounded-md focus:outline-none focus:ring-orange focus:border-orange focus:z-10 sm:text-sm'
              placeholder='Email address'
            />
          </div>

          <div>
            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange'
            >
              {loading ? "Sending reset link..." : "Send reset link"}
            </button>
          </div>

          <div className='text-center text-sm'>
            <Link href='/login' className='text-orange hover:text-orange-600'>
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
