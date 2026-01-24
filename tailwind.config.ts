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
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        "primary-hover": "var(--color-primary-hover)",
        "background-light": "var(--color-background-light)",
        "background-dark": "var(--color-background-dark)",
        "surface-light": "var(--color-surface-light)",
        "surface-dark": "var(--color-surface-dark)",
        "text-main": "var(--color-text-main)",
        "text-secondary": "var(--color-text-secondary)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      flex: {
        "2": "2 2 0%",
      },
      borderWidth: {
        "12": "12px",
      },
    },
  },
  plugins: [],
};
export default config;
