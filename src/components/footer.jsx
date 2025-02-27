import Image from "next/image";
import Link from "next/link";

export function Footer() {
  // Map nav items with a special case for "Vouches" that scrolls to the feedback section.
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Vouches", href: "/#feedback-section" }, // anchor link to feedback section
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <footer className='bg-transparent py-12 relative z-[1] font-manrope w-full'>
      <div className='px-4 max-w-[1400px] mx-auto'>
        <div className='flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-8'>
          <div className='mb-6 md:mb-0 max-w-xl'>
            <Link href='/' className='text-white text-2xl font-bold'>
              <Image
                src='/logo.svg'
                alt='Logo'
                width={220}
                height={50}
                priority
                className='w-full max-w-sm'
              />
            </Link>
            <p className='text-base font-light text-white/65 mt-2'>
              © {new Date().getFullYear()} OneShot. All rights reserved
            </p>
          </div>

          <nav className='flex gap-6 font-manrope flex-col md:flex-row items-start text-lg font-medium'>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className='text-lg text-white hover:text-orange/80 transition-colors'
                aria-label={`Navigate to ${item.label}`}
                tabIndex={0}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
