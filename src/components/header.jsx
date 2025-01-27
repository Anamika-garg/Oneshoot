"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import LogoutBtn from "./authentification/LogoutBtn";

const Navbar = () => {
  const pathname = usePathname();
  const { user, isLoading, handleLogout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicks outside the dropdown to close it
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Vouches", href: "/vouches" },
    { name: "FAQ", href: "/faq" },
  ];

  if (isLoading) {
    // Optionally, render a loading state
    return null;
  }

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm'>
      <div className='mx-auto flex items-center justify-between p-4 max-w-7xl'>
        {/* Logo Section */}
        <div className='flex items-center'>
          <Link href='/' className='text-white text-2xl font-bold'>
            <Image
              src='/logo.svg'
              alt='Logo'
              width={220}
              height={50}
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className='hidden md:flex space-x-6'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href
                  ? "bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent"
                  : "text-white hover:text-gray-300"
              }`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              <span className='font-medium'>{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Authentication Area */}
        <div className='hidden md:flex space-x-4 items-center'>
          {user ? (
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className='focus:outline-none'
                aria-haspopup='true'
                aria-expanded={isDropdownOpen}
              >
                <Avatar className='h-10 w-10'>
                  <AvatarImage
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.user_metadata.full_name || "User"}
                  />
                  <AvatarFallback>
                    {user.user_metadata.full_name ? user.user_metadata.full_name.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
              </button>

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
                      {/* User Info */}
                      <div className='space-y-1'>
                        <p className='text-lg text-white font-semibold'>
                          {user.user_metadata.full_name || "User"}
                        </p>
                        <p className='text-sm text-white/75 '>
                          {user.email}
                        </p>
                      </div>

                      {/* Divider */}
                      <hr className='border-white/15' />

                      {/* Menu Items */}
                      <div className='space-y-2'>
                        {/* Profile Info */}
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
            <>
              {/* Log In Button */}
              <Link
                href='/login?mode=login'
                className='text-white px-4 py-2 hover:text-gray-300 transition-colors'
              >
                Log in
              </Link>

              {/* Sign Up Button */}
              <Link
                href='/login?mode=signup'
                className='bg-orange text-black px-4 py-2 rounded hover:bg-orange-600 transition-colors'
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Burger Menu Icon */}
        <div className='md:hidden'>
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className='text-white focus:outline-none'
            aria-label='Toggle menu'
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className='w-8 h-8 text-orange' />
            ) : (
              <Bars3Icon className='w-8 h-8 text-orange' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key='mobileMenu'
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className='fixed top-0 right-0 bottom-0 w-64 bg-black z-40 shadow-lg'
          >
            <div className='p-4 flex flex-col z-50 bg-black'>
              {/* Close Button */}
              <div className='flex justify-end pt-2'>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='text-white focus:outline-none'
                  aria-label='Close menu'
                >
                  <XMarkIcon className='w-8 h-8 text-orange' />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className='mt-8 flex-1'>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block py-2 px-4 rounded transition-colors ${
                      pathname === link.href
                        ? "bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent"
                        : "text-white hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Authentication Area */}
              <div className='mt-4'>
                {user ? (
                  <div className='space-y-4'>
                    {/* User Info */}
                    <div className='flex items-center space-x-3'>
                      <Avatar className='h-10 w-10'>
                        <AvatarImage
                          src={user.avatar || "/default-avatar.png"}
                          alt={user.name || "User"}
                        />
                        <AvatarFallback>
                          {user.name ? user.name.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='text-white font-semibold'>
                          {user.name || "User"}
                        </p>
                        <p className='text-sm text-white/75'>{user.email}</p>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <Link
                      href='/account'
                      className='flex items-center space-x-3 text-white/90 hover:text-white py-2 px-4 rounded transition-colors'
                      onClick={() => setIsMobileMenuOpen(false)}
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

                    {/* Sign Out */}
                    <LogoutBtn />
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {/* Log In Button */}
                    <Link
                      href='/login?mode=login'
                      className='block text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>

                    {/* Sign Up Button */}
                    <Link
                      href='/login?mode=signup'
                      className='block bg-orange text-black px-4 py-2 rounded hover:bg-orange-600 transition-colors'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional: Overlay behind mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key='overlay'
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='fixed inset-0 bg-black z-30'
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden='true'
          />
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
