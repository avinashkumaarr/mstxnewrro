import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        panel: "#0e1422",
        "panel-elevated": "#131b2e",
        "panel-border": "#1b253b",
        "cyan-tech": "#00f0ff",
        "cyan-tech-dark": "#00c4d4",
        "cyan-tech-glow": "rgba(0, 240, 255, 0.15)",
        "purple-attest": "#9333ea",
        "purple-attest-light": "#a855f7",
        "ros-blue": "#38bdf8",
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "cyan-glow": "0 0 15px rgba(0, 240, 255, 0.25)",
        "purple-glow": "0 0 15px rgba(168, 85, 247, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
