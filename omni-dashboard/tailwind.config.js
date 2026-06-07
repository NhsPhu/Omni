/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1C1917", // Charcoal
        secondary: "#44403C",
        gold: "#CA8A04",
        // Remap legacy indigo to Charcoal palette
        indigo: {
          50: '#f5f5f4',
          100: '#e7e5e4',
          200: '#d6d3d1',
          300: '#a8a29e',
          400: '#78716c',
          500: '#57534e',
          600: '#44403c',
          700: '#292524',
          800: '#1c1917',
          900: '#0c0a09',
        },
        // Remap legacy purple to Gold palette
        purple: {
          50: '#fefce8',
          100: '#fef08a',
          200: '#fde047',
          300: '#facc15',
          400: '#eab308',
          500: '#ca8a04',
          600: '#a16207',
          700: '#854d0e',
          800: '#713f12',
          900: '#422006',
        },
        // Remap fuchsia and blue for gradient backgrounds
        fuchsia: { 50: '#fefce8' },
        blue: { 50: '#f5f5f4' }
      },
    },
  },
  plugins: [],
}
