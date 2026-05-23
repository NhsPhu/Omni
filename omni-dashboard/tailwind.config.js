/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#185FA5",
        secondary: "#0F6E56",
        gold: "#F59E0B",
        purple: "#8B5CF6",
      },
    },
  },
  plugins: [],
}
