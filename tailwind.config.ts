import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moma: {
          navy: "#0B1848",
          blue: "#1E3A8A",
          "blue-light": "#2D4FB8",
          "blue-dark": "#122a63",
          gold: "#FFD700",
          "gold-dark": "#E0B400",
          "gold-light": "#FFE766",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 4px 14px 0 rgba(255, 215, 0, 0.35)",
        card: "0 10px 30px -10px rgba(11, 24, 72, 0.25)",
      },
      backgroundImage: {
        "moma-gradient": "linear-gradient(135deg, #0B1848 0%, #1E3A8A 55%, #142a63 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
