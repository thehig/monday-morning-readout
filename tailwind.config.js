/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Clean cards": navy chrome, white cards on a cool ground, and colour
        // only where the call has to stop. Status separates by lightness as
        // well as hue, so it survives the chroma subsampling in a shared call.
        navy: { DEFAULT: "#1A1A4B" },
        brand: "#FF7F00",
        ink: { DEFAULT: "#15171F", 2: "#464B5D", 3: "#61667A" },
        sheet: {
          DEFAULT: "#F3F4F7",
          card: "#FFFFFF",
          rule: "#E6E8EE",
          key: "#EDEFF3",
        },
        // A state's solid block steps darker with how far behind it is
        // (block1-3); `on` is the text that sits on a pale block; `tint` is the
        // pale surface small tiles take; `mark` is the dot and bar colour.
        late: {
          ink: "#A32A1C",
          block1: "#C8442F",
          block2: "#AE3221",
          block3: "#8C2215",
          tint: "#FCEEEB",
          capsule: "#FBE1DC",
          mark: "#C8442F",
          hatch: "#F4C7BE",
        },
        watch: {
          ink: "#8A5300",
          block1: "#F7D990",
          block2: "#F1BE55",
          block3: "#E6A126",
          on: "#3D2600",
          tint: "#FEF6E4",
          mark: "#E0A027",
          hatch: "#F8E3B5",
        },
        fine: { ink: "#1E6A4A", block: "#E4F2EA", on: "#17583C", mark: "#2F8A63" },
        // Progress and sentiment fills only: quantities, never status.
        meter: "#3A3E98",
      },
      fontFamily: {
        sans: ['"Figtree"', '"Segoe UI"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,26,75,0.05), 0 6px 18px rgba(26,26,75,0.05)",
        tile: "0 1px 2px rgba(26,26,75,0.05), 0 4px 12px rgba(26,26,75,0.04)",
        key: "inset 0 -1px 0 rgba(26,26,75,0.14)",
      },
      borderRadius: {
        card: "18px",
        tile: "14px",
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
