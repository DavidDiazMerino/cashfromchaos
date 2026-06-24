import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // NVIDIA design tokens (canonical, via getdesign DESIGN.md):
        // deep-black + paper-white surfaces connected by saturated NVIDIA green.
        ink: "#000000", // pure black: dark sections + on-primary text
        panel: "#ffffff", // canvas / card surface (paper white)
        panel2: "#f7f7f7", // surface-soft (chips, wells, ghost buttons)
        edge: "#cccccc", // hairline rule
        cash: "#76b900", // NVIDIA green (primary accent)
        cashdim: "#5a8d00", // primary-dark (hover/dim)
        chaos: "#e52020", // error / escalation
        gold: "#df6500", // warning / money highlight (NVIDIA warning)
        muted: "#757575", // mute text
      },
      fontFamily: {
        // NVIDIA uses a proprietary EMEA sans; fall back to a tight bold grotesque.
        sans: [
          "NVIDIA Sans",
          "ui-sans-serif",
          "system-ui",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      // NVIDIA is unapologetically angular: 2px radius across every surface.
      // (Round avatars/dots keep `rounded-full`.)
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "2px",
        xl: "2px",
        "2xl": "2px",
        "3xl": "2px",
        full: "9999px",
      },
      boxShadow: {
        // No soft drop shadows in this system — keep only a green focus ring.
        glow: "0 0 0 1px rgba(118,185,0,0.45)",
      },
      keyframes: {
        pulseline: {
          "0%,100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        pulseline: "pulseline 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
