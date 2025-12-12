/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Memberitahu Tailwind file mana yang harus di-scan
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}