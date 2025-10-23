// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0B4FDB",
          sky: "#85B3FF",
          purple: "#7F44D9",
          yellow: "#FFB400",
          teal: "#00A8A8",
          gray: "#5B5B5B",
        },
      },
      borderRadius: { xl: "14px", "2xl": "18px" },
      boxShadow: { soft: "0 8px 24px rgba(0,0,0,0.06)" },
    },
  },
  plugins: [],
};
