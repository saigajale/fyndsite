import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-green": "#218B5A",
        "brand-green-deep": "#12613D",
        "brand-orange": "#F29A38",
        "brand-text": "#17221D",
        "brand-muted": "#6B756F",
        "brand-bg": "#F7F9F7",
        "brand-card": "#FFFFFF",
        "brand-border": "#E3EAE4",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(23, 34, 29, 0.06)",
        card: "0 4px 20px rgba(23, 34, 29, 0.08)",
      },
      maxWidth: {
        "8xl": "90rem",
      },
    },
  },
  plugins: [],
};

export default config;
