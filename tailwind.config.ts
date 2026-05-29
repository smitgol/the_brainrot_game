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
        bg: "#0a0a0f",
        surface: "#12121a",
        card: "#1a1a26",
        border: "rgba(255,255,255,0.06)",
        accent: "#ff2d55",
        teal: "#00f5d4",
        yellow: "#ffd60a",
        purple: "#bf5af2",
        muted: "#6e6e7a",
        success: "#30d158",
        danger: "#ff453a",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        label: ["var(--font-archivo)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      letterSpacing: {
        display: "-0.02em",
        label: "0.15em",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
