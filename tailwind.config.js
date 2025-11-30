/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B", // Zinc 950
        foreground: "#FAFAFA", // Zinc 50
        card: "#18181B",       // Zinc 900
        "card-foreground": "#FAFAFA",
        popover: "#18181B",
        "popover-foreground": "#FAFAFA",
        primary: "#3B82F6",    // Blue 500 - Mais profissional e neutro que o Roxo
        "primary-foreground": "#FFFFFF",
        secondary: "#27272A",  // Zinc 800
        "secondary-foreground": "#FAFAFA",
        muted: "#27272A",
        "muted-foreground": "#A1A1AA", // Zinc 400
        accent: "#27272A",
        "accent-foreground": "#FAFAFA",
        destructive: "#7F1D1D",
        "destructive-foreground": "#FAFAFA",
        border: "#27272A",
        input: "#27272A",
        ring: "#3B82F6",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
}
