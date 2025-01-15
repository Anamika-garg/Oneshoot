import Navbar, { Header } from "@/components/header";

import { ProductGrid } from "@/components/product-grid";
import { Stats } from "@/components/stats";
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className='min-h-screen bg-black'>
      
      <main>
        <Hero />
        <ProductGrid />
        <Stats />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
