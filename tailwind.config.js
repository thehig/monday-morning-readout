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
      },
      fontFamily: {
        // Reserved for text a person typed, so a sentence never looks like a
        // measurement.
        serif: ['"Literata"', "Georgia", "serif"],
      },
      minHeight: {
        // The readout's frame: the window, but never under the 1080px every
        // state was drawn for, and free to grow past either when a state needs
        // the room - the Wall reflows to more rows as the window narrows.
        //
        // Height is floored because the Wall's tiles have a min-content height
        // that no amount of flexing gets under, so a short window used to crush
        // them and drop the bottom row of facts with nothing on screen to say
        // so. Width is not floored: the tiles reflow instead, which keeps the
        // page off a horizontal scrollbar.
        frame: "max(100dvh, 1080px)",
      },
      minWidth: {
        // What one tile needs to hold its text on the lines it was drawn for.
        // The Wall fits as many columns as clear this and no more.
        card: "360px",
      },
    },
  },
  plugins: [],
};
