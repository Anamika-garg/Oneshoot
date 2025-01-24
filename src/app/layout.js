import { Manrope, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/header";

import { Footer } from "@/components/footer";
import { AppProvider } from "./AppProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body
        className={`${manrope.variable} ${inter.variable} ${montserrat.variable} antialiased bg-black`}
      >
        <AppProvider>
          <Navbar />
          {children}

          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
