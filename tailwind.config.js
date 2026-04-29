/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";
import scrollbar from "tailwind-scrollbar";

const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    animate,
    scrollbar,
  ],
};

export default config;
