/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gradientStart: "#FFDD55",
        gradientMid: "#E39319",
        orange: "#FFB528",
        black: "#060101",
        lightBlack: "#0E0E0E",
        yellow: "#FFDD55",
        textGradient:
          "bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart bg-clip-text text-transparent",
      },
      fontFamily: {
        manrope: "var(--font-manrope)",
        inter: "var(--font-inter)",
        montserrat: "var(--font-montserrat)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
