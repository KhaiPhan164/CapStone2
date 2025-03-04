/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
   extend: {
    colors: {
     primary: {
      50: "#f3f3f6",
      400: "#ba327c",
      500: "#c90086",
      DEFAULT: "#af1b73",
      700: "#812164",
     },
     secondary: "#792671",
     third: "#f8bb12",
     text: "#898a8b",
     bgbutton: "#FBC73E",
    },
   },
  },
  plugins: [],
 };
 