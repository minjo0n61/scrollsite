/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.html', './src/**/*.js', './src/**/*.css'],
  theme: {
    extend: {
      animation: {
        upAndDown: 'upAndDown 1s infinite',
      },
      keyframes: {
        upAndDown: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
    screens: {
      xs: '500px', // min-width
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
}

