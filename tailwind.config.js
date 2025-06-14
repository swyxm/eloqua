/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'creme-light': '#eae6e2', // Soft off-white, ideal for background
        'ui-card-bg': '#fbfbfb', // A very light, warm off-white for card backgrounds
        'blue-gray-light': '#73828e', // Muted blue-gray
        'beige-warm': '#e8d7c4', // Light, warm beige
        'brown-muted': '#a99985', // Muted, warm brown
        'blue-gray-dark': '#475e72', // Deeper, darker blue-gray
      },
      backdropBlur: {
        xs: '2px',
        md: '8px', // Ensuring a clear blur for glassmorphism
      },
    },
  },
  plugins: [],
} 