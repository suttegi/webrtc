/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        customPink: "#D86A89", // Назови цвет, как тебе удобно
      },
    },
  },
  safelist: [
    "bg-customPink",
    "rounded-lg",
    "gap-x-3"
  ],
  plugins: [],
}
