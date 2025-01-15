import Link from "next/link";

export function Footer() {
  return (
    <footer className='bg-black border-t border-white/10 py-12'>
      <div className='container px-4'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='mb-6 md:mb-0'>
            <Link href='/' className='text-2xl font-bold text-white'>
              OneShot
            </Link>
            <p className='text-sm text-white/60 mt-2'>
              © 2024 OneShot. All rights reserved
            </p>
          </div>

          <nav className='flex gap-6'>
            <Link
              href='/'
              className='text-sm text-white/60 hover:text-white transition-colors'
            >
              Home
            </Link>
            <Link
              href='/products'
              className='text-sm text-white/60 hover:text-white transition-colors'
            >
              Products
            </Link>
            <Link
              href='/vouchers'
              className='text-sm text-white/60 hover:text-white transition-colors'
            >
              Vouchers
            </Link>
            <Link
              href='/faq'
              className='text-sm text-white/60 hover:text-white transition-colors'
            >
              FAQ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
