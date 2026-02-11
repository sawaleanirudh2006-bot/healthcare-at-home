/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0D9488", // Refined Teal
        "secondary": "#0284C7", // Medical Blue
        "background": "#F8FAFC",
        "surface": "#FFFFFF",
        "accent-red": "#EF4444",
        "soft-red": "#FEF2F2",
      },
      fontFamily: {
        "sans": ["Plus Jakarta Sans", "sans-serif"],
        "display": ["Manrope", "sans-serif"]
      },
      boxShadow: {
        "premium": "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 12px -4px rgba(0, 0, 0, 0.03)",
        "soft": "0 2px 8px rgba(0, 0, 0, 0.04)",
        "input": "0 2px 4px rgba(0, 0, 0, 0.02)"
      }
    },
  },
  plugins: [],
}
