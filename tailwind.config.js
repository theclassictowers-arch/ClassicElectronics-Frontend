/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";

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
    require('tailwind-scrollbar'),
  ],
};

export default config;
