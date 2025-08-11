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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        steam: {
          blue: '#1b2838',
          darkblue: '#171a21',
          lightblue: '#2a475e',
          green: '#90ba3c',
          gold: '#f1c40f'
        }
      },
      fontFamily: {
        'steam': ['Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
