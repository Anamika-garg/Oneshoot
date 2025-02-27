"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBasket } from "lucide-react";
import NavAvatar from "./NavAvatar";
import LogoutBtn from "../authentification/LogoutBtn";
import { HamburgerMenu } from "../ui/HamburgerMenu";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { getCartCount } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const cartCount = getCartCount();

  useEffect(() => {
    if (pathname === "/" && window.location.hash === "#feedback-section") {
      setTimeout(() => {
        const feedbackSection = document.getElementById("feedback-section");
        if (feedbackSection) {
          feedbackSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // Small delay to ensure the DOM is ready
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleVouchesClick = (e) => {
    e.preventDefault();
    if (pathname === "/") {
      const feedbackSection = document.getElementById("feedback-section");
      if (feedbackSection) {
        feedbackSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/#feedback-section");
    }
    closeMobileMenu();
  };

  if (isLoading) return null;

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "#", label: "Vouches", onClick: handleVouchesClick },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md font-manrope '>
      <div className=' mx-auto flex items-center justify-between p-4 max-w-[1400px]'>
        {/* Logo */}
        <Link href='/' className='text-white text-2xl font-bold'>
          <Image src='/logo.svg' alt='Logo' width={220} height={50} priority />
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-6 text-lg font-medium'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                pathname === item.href
                  ? "text-orange"
                  : "text-white hover:text-gray-300"
              }`}
              onClick={item.onClick}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Section: Cart & User Profile (Desktop) */}
        <div className='hidden md:flex items-center space-x-4'>
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
                <NavAvatar user={user} />
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
                      <div className='space-y-2 p-0'>
                        <Link
                          href='/account'
                          className='flex items-center space-x-3 text-white/90 hover:text-white py-2 pr-4 rounded transition-colors'
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
            <div className='space-x-4'>
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

        {/* Mobile Right Section: Cart & Burger Menu */}
        <div className='md:hidden flex items-center space-x-4'>
          {cartCount > 0 && (
            <Link
              href='/cart'
              className='relative flex items-center justify-center text-white hover:text-gray-300'
            >
              <ShoppingBasket className='h-6 w-6' />
              {cartCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-orange text-black text-xs font-bold rounded-full h-3 w-3 flex items-center justify-center'>
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <HamburgerMenu
            isOpen={isMobileMenuOpen}
            setIsOpen={setIsMobileMenuOpen}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className='md:hidden bg-black/90 backdrop-blur-sm'
          >
            <div className='container mx-auto py-4 space-y-4'>
              {user && (
                <div className='flex items-center space-x-4 px-4 py-2'>
                  <NavAvatar user={user} />
                  <div>
                    <p className='font-semibold text-white'>
                      {user.user_metadata.full_name || "User"}
                    </p>
                    <p className='text-sm text-white/75'>{user.email}</p>
                  </div>
                </div>
              )}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-2 px-4 ${
                    pathname === item.href ? "text-orange" : "text-white"
                  }`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
              {!user ? (
                <>
                  <Link
                    href='/login?mode=login'
                    className='block py-2 px-4 text-white hover:bg-white/10 rounded transition-colors'
                    onClick={closeMobileMenu}
                  >
                    Log in
                  </Link>
                  <Link
                    href='/login?mode=signup'
                    className='block py-2 px-4 bg-orange text-black rounded hover:bg-orange-600 transition-colors'
                    onClick={closeMobileMenu}
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href='/account'
                    className='block py-2 px-4 text-white hover:bg-white/10 rounded transition-colors'
                    onClick={closeMobileMenu}
                  >
                    Profile Info
                  </Link>
                  <div className='py-2 px-4'>
                    <LogoutBtn />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
