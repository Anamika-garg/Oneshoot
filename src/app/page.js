import { ProductGrid } from "@/components/product-grid";
import { Stats } from "@/components/stats";
import { ContactForm } from "@/components/contact-form";

import Hero from "@/components/hero";
import Feedback from "@/components/feedback";

export default function Home() {
  return (
    <div className='min-h-screen '>
      <main className="overflow-hidden">
        <Hero />
        <ProductGrid />
        <Stats />
        <Feedback />
        <ContactForm />
        {/* <Footer /> */}
      </main>
    
    </div>
  );
}
