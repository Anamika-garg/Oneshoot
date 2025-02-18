import { Manrope, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation/header";
import { Footer } from "@/components/footer";
import { AppProvider } from "./AppProvider";
import { PageTransition, MotionProvider } from "@/components/PageTransition";

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
  metadataBase: new URL("https://yourdomain.com"),
  title: {
    default: "One Shot Account Shop",
    template: "%s | One Shot",
  },
  description:
    "Your app description goes here. Make it compelling and keyword-rich.",
  keywords: ["key1", "key2", "key3"],
  authors: [{ name: "Your Name", url: "https://yourdomain.com" }],
  creator: "Your Name or Company",
  publisher: "Your Company Name",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
    siteName: "Your App Name",
    title: "Your App Name",
    description: "Your app description for social media sharing",
    images: [
      {
        url: "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Your App Name",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourTwitterHandle",
    creator: "@yourTwitterHandle",
    images: ["https://yourdomain.com/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "your-google-site-verification-code",

    yahoo: "your-yahoo-verification-code",
    other: {
      me: ["your-personal-website.com", "mailto:your-email@example.com"],
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body
        className={`${manrope.variable} ${inter.variable} ${montserrat.variable} antialiased bg-black font-manrope`}
      >
        <MotionProvider>
          <AppProvider>
            <Navbar />
            <PageTransition>{children}</PageTransition>
            <Footer />
          </AppProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
