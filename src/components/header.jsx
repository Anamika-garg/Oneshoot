"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { users } from "@/utils/users";
import { auth } from "@/utils/auth";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  

  const handleLogout = async () => {
    await auth.logOut();
    setUser(null);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Vouches", href: "/vouches" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm'>
      <div className='mx-auto flex items-center justify-between p-4'>
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

        {/* Authentication Buttons or User Menu */}
        <div className='hidden md:flex space-x-4'>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-8 w-8 rounded-full'
                >
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>
                      {user.name}
                    </p>
                    <p className='text-xs leading-none text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/account'>My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
