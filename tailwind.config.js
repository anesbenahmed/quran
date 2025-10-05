/** @type {import('tailwindcss').Config} */
// npx tailwindcss -i ./src/renderer/src/assets/styles/input.css -o ./src/renderer/src/assets/styles/output.css  --watch
module.exports = {
  darkMode:'class',
  content: [
    './src/renderer/src/**/*.{html,js,ts,jsx,tsx}',
    './src/renderer/src/components/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}