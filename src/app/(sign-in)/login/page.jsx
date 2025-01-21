"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { motion } from "framer-motion"
import { auth } from "@/utils/auth"

export default function SignIn() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!form.email || !form.password) {
      toast.error("All fields are required.")
      return false
    }
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address.")
      return false
    }
    return true
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    try {
      await auth.logIn(form.email, form.password)
      toast.success("Successfully signed in!")
      router.push("/account")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-black px-4 font-manrope relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute right-0 -translate-x-14 bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart w-[440px] h-[440px] rounded-full blur-[300px] opacity-80" />
      <motion.div
        className="max-w-md w-full space-y-8 bg-[#0E0E0E] p-8 rounded-2xl relative z-10"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div>
          <h2 className="mt-2 text-center text-5xl font-extrabold text-white">SIGN IN</h2>
          <div className="text-center text-base mt-4">
            <span className="text-white/55">Don't have an account? </span>
            <Link href="/signup" className="text-orange hover:text-orange-600">
              Sign up
            </Link>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="email" className="text-white text-xl mb-2">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white text-xl mb-2">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="********"
                className="bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link
              href="/reset-password"
              className="text-sm text-white/55 hover:text-orange text-center mx-auto transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-base font-semibold rounded-md text-black bg-orange hover:bg-yellow focus:outline-none transition-all duration-200"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

