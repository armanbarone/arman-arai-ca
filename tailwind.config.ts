import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark surfaces — warm near-black base
        ivory:        "#080704",   // main page background
        linen:        "#0E0C0A",   // slightly lifted surface
        parchment:    "#141210",   // darkroom card surface
        panel:        "#1E1B16",   // modal / elevated panel

        // Light values — bone and cream spectrum
        cream:        "#E8E0D0",   // bone: main text / light accent

        // Accent — muted bronze (sole accent)
        blush:        "#7A6A58",   // ultra-dim warm gray
        rose:         "#B8956A",   // muted bronze — THE accent
        "rose-dark":  "#9A7A54",

        // Utility
        slate:        "#5A5148",   // very dim text
        ink:          "#1A1612",   // near-black (button bg, contrast)
        dust:         "#2A2520",   // borders / dividers
      },
      fontFamily: {
        sans:   ["var(--font-jost)", "sans-serif"],
        serif:  ["var(--font-cormorant)", "serif"],
        script: ["var(--font-great-vibes)", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
