"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import Link from "next/link"

import { motion } from "framer-motion"
import { getAuthError } from "@/utils/auth-errors"
import { auth } from "@/utils/auth"

export default function SignUp() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    const { name, email, password, confirmPassword } = form
    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required.")
      return false
    }
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.")
      return false
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.")
      return false
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return false
    }
    return true
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
  
    try {
      await auth.signUp(form.email, form.password, form.name)
      toast.success("Check your email to confirm your account!", {
        duration: 5000,
        style: {
          background: "#101010",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.2rem",
        },
      })
      router.push("/login")
    } catch (error) {
      console.error("SignUp Error:", error) // Add this line
      const { message } = getAuthError(error)
      toast.error(message, {
        duration: 5000,
        style: {
          background: "#101010",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.2rem",
        },
      })
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
          <h2 className="mt-2 text-center text-5xl font-extrabold text-white">SIGN UP</h2>
          <div className="text-center text-base mt-4">
            <span className="text-white/55">Already have an account? </span>
            <Link href="/login" className="text-orange hover:text-orange-600">
              Sign in
            </Link>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="name" className="text-white text-xl mb-2">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2"
              />
            </div>
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
                className="bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-white text-xl mb-2">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="bg-[#0E0E0E] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-offset-0 focus:outline-none transition-all duration-200 mt-2"
              />
            </div>
          </div>
          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-base font-semibold rounded-md text-black bg-orange hover:bg-yellow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange"
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

