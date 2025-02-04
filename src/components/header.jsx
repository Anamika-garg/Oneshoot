"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import LogoutBtn from "./authentification/LogoutBtn";
import { ShoppingBasket } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { getCartCount } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const cartCount = getCartCount();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (isLoading) return null;

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm font-manrope'>
      <div className='container mx-auto flex items-center justify-between p-4 '>
        {/* Logo */}
        <Link href='/' className='text-white text-2xl font-bold'>
          <Image src='/logo.svg' alt='Logo' width={220} height={50} priority />
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-6 text-lg font-medium'>
          <Link
            href='/'
            className={`transition-colors ${pathname === "/" ? "text-orange" : "text-white hover:text-gray-300"}`}
          >
            Home
          </Link>
          <Link
            href='/products'
            className={`transition-colors ${pathname === "/products" ? "text-orange" : "text-white hover:text-gray-300"}`}
          >
            Products
          </Link>
          <Link
            href='/vouches'
            className={`transition-colors ${pathname === "/vouches" ? "text-orange" : "text-white hover:text-gray-300"}`}
          >
            Vouches
          </Link>
          <Link
            href='/faq'
            className={`transition-colors ${pathname === "/faq" ? "text-orange" : "text-white hover:text-gray-300"}`}
          >
            FAQ
          </Link>
        </div>

        {/* Right Section: Cart & User Profile */}
        <div className='flex items-center space-x-4'>
          {/* Cart Icon - Positioned near Avatar */}
          {cartCount > 0 && (
            <Link
              href='/cart'
              className='relative flex items-center justify-center text-white hover:text-gray-300'
            >
              <ShoppingBasket className='h-6 w-6' />
              {cartCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-orange text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className='focus:outline-none flex items-center space-x-2'
                aria-haspopup='true'
                aria-expanded={isDropdownOpen}
              >
                <Avatar className='h-10 w-10'>
                  <AvatarImage
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.user_metadata.full_name || "User"}
                  />
                  <AvatarFallback>
                    {user.user_metadata.full_name
                      ? user.user_metadata.full_name.charAt(0)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className='absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-sm border border-white/15 rounded-xl shadow-lg'
                  >
                    <div className='p-4 space-y-4'>
                      <div className='space-y-1'>
                        <p className='text-lg text-white font-semibold'>
                          {user.user_metadata.full_name || "User"}
                        </p>
                        <p className='text-sm text-white/75'>{user.email}</p>
                      </div>
                      <hr className='border-white/15' />
                      <div className='space-y-2'>
                        <Link
                          href='/account'
                          className='flex items-center space-x-3 text-white/90 hover:text-white py-2 px-4 rounded transition-colors'
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='w-5 h-5'
                          >
                            <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                            <circle cx='12' cy='7' r='4' />
                          </svg>
                          <span>Profile Info</span>
                        </Link>
                        <LogoutBtn />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className='hidden md:flex space-x-4'>
              <Link
                href='/login?mode=login'
                className='text-white px-4 py-2 hover:text-gray-300 transition-colors'
              >
                Log in
              </Link>
              <Link
                href='/login?mode=signup'
                className='bg-orange text-black px-4 py-2 rounded hover:bg-orange-600 transition-colors'
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Burger Menu */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className='md:hidden text-white focus:outline-none'
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className='w-8 h-8 text-orange' />
          ) : (
            <Bars3Icon className='w-8 h-8 text-orange' />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
