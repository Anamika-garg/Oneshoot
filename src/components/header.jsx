"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Vouches", href: "/vouches" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <nav className=' fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm'>
      <div className=' mx-auto flex items-center justify-between p-4'>
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

        {/* Desktop Navigation */}
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

        {/* Authentication Buttons */}
        <div className='hidden md:flex space-x-4'>
          <Link
            href='/login'
            className='text-white px-4 py-2 hover:text-gray-300 transition-colors'
          >
            Log in
          </Link>
          <Link
            href='/signup'
            className='bg-orange text-black px-4 py-2 rounded hover:bg-orange-600 transition-colors'
          >
            Sign up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className='md:hidden text-white'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label='Toggle mobile menu'
        >
          {isMobileMenuOpen ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16m-7 6h7'
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-sm p-4'>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block py-2 ${
                pathname === link.href
                  ? "bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent"
                  : "text-white"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link href='/login' className='block py-2 text-white'>
            Log in
          </Link>
          <Link href='/signup' className='block py-2 text-white'>
            Sign up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
