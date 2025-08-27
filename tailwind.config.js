/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class strategy for dark mode toggling via the `dark` class on <html>
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        /* Surface Colors */
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-hover': 'rgb(var(--surface-hover) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',

        /* Text Colors */
        primary: 'rgb(var(--text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
        'accent-text': 'rgb(var(--accent-text) / <alpha-value>)',

        /* Accent Colors */
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',

        /* Semantic Colors */
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        error: 'rgb(var(--error) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',

        /* Input Control Colors */
        'input-bg': 'rgb(var(--input-bg) / <alpha-value>)',
        'input-border': 'rgb(var(--input-border) / <alpha-value>)',
        'input-border-hover': 'rgb(var(--input-border-hover) / <alpha-value>)',
      },
      backdropBlur: {
        xs: '2px',
        md: '8px', // Ensuring a clear blur for glassmorphism
      },
    },
  },
  plugins: [],
} 