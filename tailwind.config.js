/** @type {import('tailwindcss').Config} */
// npx tailwindcss -i ./src/renderer/src/assets/styles/input.css -o ./src/renderer/src/assets/styles/output.css  --watch
module.exports = {
  darkMode:'class',
  content: [
    './src/renderer/src/**/*.{html,js,ts,jsx,tsx}',
    './src/renderer/src/components/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}