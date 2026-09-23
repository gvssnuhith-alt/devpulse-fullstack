/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(240 3.7% 15.9%)",
        background: "hsl(240 10% 3.9%)",
        foreground: "hsl(0 0% 98%)",
        muted: "hsl(240 3.7% 15.9%)",
        "muted-foreground": "hsl(240 5% 64.9%)",
        accent: "hsl(240 3.7% 15.9%)",
        "accent-foreground": "hsl(0 0% 98%)",
        card: "hsl(240 10% 5%)",
        "card-foreground": "hsl(0 0% 98%)",
      }
    },
  },
  plugins: [],
}
