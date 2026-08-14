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
        // These are armanarai.com's --dim-soft and --dim, so body copy is the
        // same colour on both sites. The values this site shipped with
        // (#7A6A58 and #5A5148) measured 3.87:1 and 2.60:1 against the page and
        // were under the WCAG AA floor.
        blush:        "#A89480",   // --dim-soft on armanarai.com
        rose:         "#B8956A",   // muted bronze — THE accent, 7.2:1
        "rose-dark":  "#9A7A54",

        // Utility
        slate:        "#857060",   // --dim on armanarai.com
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
