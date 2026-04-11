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
        void: "#050508",
        surface: "#0a0a0f",
        "surface-2": "#10101a",
        border: "#1a1a2e",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "'Inter'", "Roboto", "sans-serif"],
        mono: ["'SF Mono'", "'Fira Code'", "'JetBrains Mono'", "'Courier New'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
