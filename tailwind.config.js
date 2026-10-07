/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Readout palette. Status separates by lightness as well as hue, so it
        // survives the chroma subsampling in a shared video call.
        navy: { DEFAULT: "#1A1A4B", deep: "#12123A", line: "#2E2E63" },
        brand: "#FF7F00",
        ink: { DEFAULT: "#15171F", 2: "#474B5C", 3: "#6E7384" },
        sheet: { DEFAULT: "#F4F5F8", card: "#FFFFFF", rule: "#D8DAE3" },
        late: { ink: "#7E2A1E", wash: "#F8E2DD", mark: "#B8442F" },
        watch: { ink: "#6E4A00", wash: "#FAEED2", mark: "#BC8A14" },
        fine: { ink: "#1C5B46", wash: "#E3EFE9", mark: "#2E7D63" },
        meter: { DEFAULT: "#3B3B87", track: "#E2E3EC" },

        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      fontFamily: {
        // Reserved for text a person typed, so a sentence never looks like a
        // measurement.
        serif: ['"Literata"', "Georgia", "serif"],
      },
      minHeight: {
        // Every state is drawn for a 1920x1080 screen share, and the Wall's
        // ranked grid uses the full height of it - ten tiles in two rows have a
        // floor of their own that no amount of flexing gets under.
        //
        // So the frame never shrinks past the size it was drawn at. In a window
        // shorter than this the page scrolls, which costs the operator a
        // scroll but keeps every layout at its designed proportions. The
        // alternative - letting the frame shrink - crushes the grid instead,
        // and a crushed tile loses the bottom row of facts silently.
        frame: "1080px",
      },
      minWidth: {
        // The other half of the frame. Narrow the window and a tile's text
        // reflows rather than shrinking: a name that fitted one line takes two,
        // the header grows, and every row below it slides out of line with the
        // neighbouring tiles. The grid stops reading as one object, which is
        // the whole point of it.
        frame: "1920px",
        // What one tile needs to hold its text without reflowing, which five
        // across the frame comfortably clear. Stated on the grid as well, so
        // the guarantee survives a change to the column count.
        card: "360px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
