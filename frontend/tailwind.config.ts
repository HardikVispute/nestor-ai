import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Glacial Indifference'", "sans-serif"],
        body: ["'Glacial Indifference'", "'Barlow'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

