/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
   extend: {
    colors: {
     primary: {
      50: "#f3f3f6",
      400: "#ba327c",
      500: "#ff9942",
      DEFAULT: "#af1b73",
      700: "#812164",
     },
     secondary: "#ff8b10",
     third: "#f8bb12",
     text: "#898a8b",
     bgbutton: "#FBC73E",
    },
    fontFamily: {
      sans: ['Roboto', 'sans-serif']
    }
   },
  },
  plugins: [],
 };
 