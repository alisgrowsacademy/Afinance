/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0e0e0f",
        "bg-card": "#1a1a1c",
        "bg-card2": "#22222a",
        border: "#2a2a2e",
        accent: "#c8f135",
        blue: "#4fa8ff",
        purple: "#b794f4",
        orange: "#fb923c",
        green: "#4ade80",
        red: "#f87171",
        "text-primary": "#f2f2f0",
        "text-muted": "#8a8a8f",
        "text-faint": "#555558",
      },
      fontFamily: {
        syne: ["Syne_700Bold"],
        "syne-extra": ["Syne_800ExtraBold"],
        "dm-sans": ["DMSans_400Regular"],
        "dm-sans-medium": ["DMSans_500Medium"],
        "dm-sans-bold": ["DMSans_700Bold"],
        "dm-mono": ["DMMono_400Regular"],
      },
    },
  },
  plugins: [],
};
