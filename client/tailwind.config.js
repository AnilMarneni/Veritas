/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f9f1',
          100: '#e1f0e0',
          200: '#c5e2c2',
          300: '#9dcd99',
          400: '#6eb169',
          500: '#4b9646',
          600: '#387b33',
          700: '#2f622b',
          800: '#274f24',
          900: '#21421f',
        }
      }
    },
  },
  plugins: [],
}
