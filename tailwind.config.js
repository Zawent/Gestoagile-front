/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#acc55f",
        "background-dark": "#0A1439",
        "surface-dark": "#1B2E58",
      },
    },
  },
  plugins: [],
}