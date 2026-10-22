import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        butter: { DEFAULT: "#F6E7A9", soft: "#FBF2CF" },
        sage: { DEFAULT: "#C9D9BD", soft: "#E3ECDB", deep: "#A9C09A" },
        cream: { DEFAULT: "#FFF9EE", deep: "#F8EEDC" },
        biscuit: { DEFAULT: "#DFAE91", soft: "#F0D5C4", deep: "#B9805F" },
        ink: { DEFAULT: "#493D2E", soft: "#6E604E", faint: "#9A8B76" },
        olive: { DEFAULT: "#7B8767", deep: "#55603F" },
        blush: "#EFD3C6",
        pond: "#CFE1DC",
      },
      fontFamily: {
        display: ['"Fraunces Variable"', "Georgia", "serif"],
        body: ['"Nunito"', "system-ui", "sans-serif"],
        hand: ['"Caveat"', "cursive"],
      },
      borderRadius: {
        blob: "28px 22px 30px 20px / 22px 30px 20px 28px",
      },
      boxShadow: {
        card: "0 1px 0 rgba(73,61,46,.06), 0 8px 24px -12px rgba(73,61,46,.22)",
        lift: "0 2px 0 rgba(73,61,46,.06), 0 18px 36px -16px rgba(73,61,46,.32)",
        inset: "inset 0 0 0 1.5px rgba(73,61,46,.18)",
      },
      keyframes: {
        bob: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        steam: {
          "0%": { opacity: "0", transform: "translateY(4px) scaleY(.8)" },
          "40%": { opacity: ".7" },
          "100%": { opacity: "0", transform: "translateY(-10px) scaleY(1.1)" },
        },
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
      },
      animation: {
        bob: "bob 3.2s ease-in-out infinite",
        steam: "steam 2.6s ease-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
