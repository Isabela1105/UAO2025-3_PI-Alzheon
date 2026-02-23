/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          300: '#2c6d67',
          400: '#2c6d67',
          500: '#2c6d67',
        },
        secondary: {
          200: '#ffffff',
        },
        gray: "rgba(0, 0, 0, 0.74)",
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      animation: {
        gradient: 'gradient 3s ease infinite',
      },
    },
  },
  corePlugins: {
    preflight: false
  },
  plugins: [],
}